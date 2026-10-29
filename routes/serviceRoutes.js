import express from 'express';
import Service from '../models/Service.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/services
// @desc    Get all services with optional filters (category, search q, section)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, section, q, featured, minPrice, maxPrice } = req.query;
    const filter = { isAvailable: true };

    if (category && category !== 'All') {
      filter.category = new RegExp(category, 'i');
    }
    if (section) {
      filter.section = section;
    }
    if (featured === 'true') {
      filter.isFeatured = true;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.numericPrice = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        filter.numericPrice.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        filter.numericPrice.$lte = Number(maxPrice);
      }
    }
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    const services = await Service.find(filter).sort({ isFeatured: -1, rating: -1 });

    const formattedServices = services.map((s) => {
      const item = s.toObject ? s.toObject() : s;
      if (!item.price || item.price.includes('$')) {
        item.price = `₹${item.numericPrice || 499}`;
      }
      return item;
    });

    // Grouping helper for the Mendx UI sections if requested without specific filters
    const popular = formattedServices.filter((s) => s.section === 'popular');
    const essential = formattedServices.filter((s) => s.section === 'essential');
    const directory = formattedServices.filter((s) => s.section === 'directory');

    res.json({
      success: true,
      count: formattedServices.length,
      services: formattedServices,
      featured: popular.length > 0 ? popular : formattedServices.slice(0, 4),
      essentials: essential.length > 0 ? essential : formattedServices.slice(4, 11),
      directory: directory.length > 0 ? directory : formattedServices,
    });
  } catch (error) {
    console.error('[Services Get Error]:', error);
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

// @route   GET /api/services/category/:category
// @desc    Get services by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const services = await Service.find({
      category: { $regex: new RegExp(`^${category}$`, 'i') },
      isAvailable: true,
    });
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services by category.' });
  }
});

// @route   GET /api/services/search
// @desc    Search services across categories, subcategories, names, and keywords
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({ success: true, count: 0, services: [] });
    }
    const keyword = q.trim();
    const regex = new RegExp(keyword, 'i');

    let mongoServices = [];
    try {
      mongoServices = await Service.find({
        $or: [
          { name: regex },
          { description: regex },
          { category: regex },
          { tag: regex },
        ],
        isAvailable: true,
      });
    } catch (e) {
      // MongoDB optional
    }

    // Also search the structured 5 categories dataset
    let structuredMatches = [];
    try {
      const { CATEGORIES_DATA } = await import('./categoryRoutes.js');
      CATEGORIES_DATA.forEach((cat) => {
        cat.subcategories.forEach((subcat) => {
          subcat.services.forEach((srv) => {
            const matches =
              srv.name.toLowerCase().includes(keyword.toLowerCase()) ||
              srv.shortDescription.toLowerCase().includes(keyword.toLowerCase()) ||
              cat.name.toLowerCase().includes(keyword.toLowerCase()) ||
              subcat.name.toLowerCase().includes(keyword.toLowerCase()) ||
              (srv.keywords && srv.keywords.some((k) => k.toLowerCase().includes(keyword.toLowerCase())));

            if (matches) {
              structuredMatches.push({
                _id: srv.id,
                id: srv.id,
                name: srv.name,
                title: srv.name,
                category: cat.name,
                categorySlug: cat.slug,
                subcategoryName: subcat.name,
                description: srv.shortDescription,
                fullDescription: srv.fullDescription,
                price: `₹${srv.price}`,
                numericPrice: srv.price,
                duration: srv.duration,
                rating: srv.rating,
                reviewsCount: srv.reviewsCount,
                image: srv.image,
                included: srv.included,
                notIncluded: srv.notIncluded,
              });
            }
          });
        });
      });
    } catch (e) {
      // Ignore
    }

    // Merge and deduplicate
    const combined = [...structuredMatches];
    mongoServices.forEach((ms) => {
      if (!combined.some((c) => c.name.toLowerCase() === ms.name.toLowerCase())) {
        combined.push(ms);
      }
    });

    res.json({
      success: true,
      query: keyword,
      count: combined.length,
      services: combined,
    });
  } catch (error) {
    res.status(500).json({ error: 'Search failed.' });
  }
});

// @route   GET /api/services/:id
// @desc    Get single service by ID or slug
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let service;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      service = await Service.findById(id);
    } else {
      service = await Service.findOne({ slug: id });
    }

    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service details.' });
  }
});

// @route   POST /api/services
// @desc    Create a new service
// @access  Admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, service, message: 'Service created successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to create service.' });
  }
});

// @route   PUT /api/services/:id
// @desc    Update a service
// @access  Admin only
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    res.json({ success: true, service, message: 'Service updated successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to update service.' });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete a service
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    res.json({ success: true, message: 'Service removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service.' });
  }
});

export default router;
