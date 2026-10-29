import User from '../models/User.js';
import Service from '../models/Service.js';
import Coupon from '../models/Coupon.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

export const seedDatabase = async () => {
  try {
    const homeServicesCatalog = [
      {
        name: 'Full Home Deep Cleaning',
        category: 'Home Cleaning',
        section: 'popular',
        tag: 'Bestseller',
        description: 'Complete floor-to-ceiling deep cleaning, vacuuming, dusting, and sanitization.',
        longDescription: 'Intensive mechanized floor scrubbing, window pane cleaning, balcony dusting, cobweb removal, and hospital-grade sanitization for every room.',
        price: '₹1,499',
        numericPrice: 1499,
        duration: '4-5 hours',
        color: '#5669E8',
        accentColor: '#36C998',
        textColor: '#FFFFFF',
        badgeBg: '#36C998',
        isFeatured: true,
        rating: 4.92,
        reviewsCount: 384,
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Bathroom Deep Cleaning & Sanitization',
        category: 'Bathroom Cleaning',
        section: 'popular',
        tag: 'High Demand',
        description: 'Hard water stain removal, tile descaling, toilet & fixture sanitization.',
        longDescription: 'High-pressure steam and eco-friendly acidic compound cleaning to remove stubborn limescale, hard water deposits, mold, and grout stains.',
        price: '₹499',
        numericPrice: 499,
        duration: '1-2 hours',
        color: '#0B0B2B',
        accentColor: '#5669E8',
        textColor: '#FFFFFF',
        badgeBg: '#5669E8',
        isFeatured: true,
        rating: 4.89,
        reviewsCount: 512,
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Modular Kitchen Deep Degreasing',
        category: 'Kitchen Cleaning',
        section: 'popular',
        tag: 'Top Rated',
        description: 'Appliance exterior, exhaust, chimney degreasing, and cabinet wiping.',
        longDescription: 'Thorough grease removal from chimney filters, countertop sterilizing, splashback tile scrub, and stainless-steel sink restoration.',
        price: '₹899',
        numericPrice: 899,
        duration: '2-3 hours',
        color: '#36C998',
        accentColor: '#0B0B2B',
        textColor: '#0B0B2B',
        badgeBg: '#0B0B2B',
        isFeatured: true,
        rating: 4.94,
        reviewsCount: 290,
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Leak Detection & Pipe Repair',
        category: 'Plumbing Services',
        section: 'popular',
        tag: 'Fast Response',
        description: 'Promptly address and fix tap, pipe, drain leaks, and valve repairs.',
        longDescription: 'Acoustic leak inspection, concealed pipe sealing, angle stopcock replacement, washbasin trap unclogging, and pressure balance testing.',
        price: '₹299',
        numericPrice: 299,
        duration: '1-2 hours',
        color: '#5669E8',
        accentColor: '#EEF0FF',
        textColor: '#FFFFFF',
        badgeBg: '#36C998',
        isFeatured: true,
        rating: 4.88,
        reviewsCount: 420,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Electrical Inspection & Appliance Wiring',
        category: 'Electrical Repairs',
        section: 'essential',
        tag: 'Safety Verified',
        description: 'Switchboard repairs, MCB trip diagnostics, wiring, and fixture installs.',
        longDescription: 'Full circuit checking, earthing test, modern modular switch fitting, ceiling fan mounting, chandelier hanging, and inverter setup.',
        price: '₹249',
        numericPrice: 249,
        duration: '1-2 hours',
        color: '#EEF0FF',
        accentColor: '#5669E8',
        textColor: '#17172B',
        badgeBg: '#5669E8',
        isFeatured: true,
        rating: 4.95,
        reviewsCount: 360,
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'AC Jet Service & Gas Charging',
        category: 'AC Installation and Repair',
        section: 'essential',
        tag: 'Summer Special',
        description: 'High-pressure jet wash, filter cleaning, cooling coil diagnosis, gas refill.',
        longDescription: 'Deep foam jet cleaning of indoor and outdoor coils, drain tray flushing, anti-bacterial spray, and cooling temperature calibration.',
        price: '₹599',
        numericPrice: 599,
        duration: '1-2 hours',
        color: '#5669E8',
        textColor: '#FFFFFF',
        isFeatured: true,
        rating: 4.91,
        reviewsCount: 610,
        image: 'https://images.unsplash.com/photo-1631545830691-d8ec11ec5e96?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Wall Painting & Waterproofing',
        category: 'Painting Services',
        section: 'essential',
        description: 'Interior wall repainting, dampness treatment, putty touch-up, and texture coats.',
        price: '₹1,999',
        numericPrice: 1999,
        duration: '1-2 days',
        color: '#36C998',
        textColor: '#0B0B2B',
        isFeatured: false,
        rating: 4.87,
        reviewsCount: 180,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Custom Carpentry & Furniture Repair',
        category: 'Carpenter Services',
        section: 'essential',
        description: 'Door lock fitting, hinge fixes, wardrobe repairs, custom shelf installations.',
        price: '₹349',
        numericPrice: 349,
        duration: '1-3 hours',
        color: '#0B0B2B',
        textColor: '#FFFFFF',
        isFeatured: false,
        rating: 4.93,
        reviewsCount: 245,
        image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Major Appliance Diagnostics & Repair',
        category: 'Appliance Repair',
        section: 'essential',
        description: 'Washing machine, refrigerator, microwave, and water purifier servicing.',
        price: '₹399',
        numericPrice: 399,
        duration: '1-2 hours',
        color: '#5669E8',
        textColor: '#FFFFFF',
        isFeatured: false,
        rating: 4.9,
        reviewsCount: 310,
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Herbal Pest Control Treatment',
        category: 'Pest Control',
        section: 'essential',
        description: 'Odorless cockroach, ant, and termite protection with eco-friendly gels.',
        price: '₹799',
        numericPrice: 799,
        duration: '1-2 hours',
        color: '#EEF0FF',
        textColor: '#17172B',
        isFeatured: false,
        rating: 4.86,
        reviewsCount: 195,
        image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Salon & Spa at Home for Women & Men',
        category: 'Salon at Home',
        section: 'essential',
        description: 'Facials, waxing, pedicure, manicure, head massage, and grooming.',
        price: '₹699',
        numericPrice: 699,
        duration: '1-3 hours',
        color: '#5669E8',
        textColor: '#FFFFFF',
        isFeatured: false,
        rating: 4.96,
        reviewsCount: 480,
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Doorstep Laundry & Dry Cleaning',
        category: 'Laundry Services',
        section: 'essential',
        description: 'Wash, fold, steam iron, and delicate garment dry cleaning with pickup.',
        price: '₹299',
        numericPrice: 299,
        duration: '24-48 hours',
        color: '#36C998',
        textColor: '#0B0B2B',
        isFeatured: false,
        rating: 4.88,
        reviewsCount: 220,
        image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80',
      },
    ];

    // Upsert the catalog items so that all 12 categories are guaranteed present
    for (const item of homeServicesCatalog) {
      await Service.findOneAndUpdate(
        { category: item.category },
        { $set: item },
        { upsert: true, new: true }
      );
    }
    console.log('[Mendx Seed] Ensured all 12 home service categories exist with INR pricing.');

    // Seed default coupons if none exist
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      console.log('[Mendx Seed] Seeding promotional coupons...');
      const defaultCoupons = [
        {
          code: 'WELCOME100',
          discountType: 'fixed',
          discountValue: 100,
          minOrderValue: 400,
          maxDiscount: 100,
          expirationDate: new Date('2028-12-31'),
          usageLimit: 5000,
          isActive: true,
        },
        {
          code: 'MENDX20',
          discountType: 'percentage',
          discountValue: 20,
          minOrderValue: 500,
          maxDiscount: 300,
          expirationDate: new Date('2028-12-31'),
          usageLimit: 5000,
          isActive: true,
        },
      ];
      await Coupon.insertMany(defaultCoupons);
      console.log('[Mendx Seed] Seeded coupons WELCOME100 and MENDX20.');
    }

    // Seed sample users (Admin, Worker, Customer) if none exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Mendx Seed] Seeding initial admin, worker, and customer accounts...');
      
      const admin = await User.create({
        fullName: 'Mendx Administrator',
        email: 'admin@mendx.com',
        password: 'adminpassword123',
        phone: '+91 98765 43210',
        role: 'admin',
        city: 'Mumbai',
      });

      const worker = await User.create({
        fullName: 'Ramesh Kumar',
        email: 'pro@mendx.com',
        password: 'propassword123',
        phone: '+91 98765 01234',
        role: 'worker',
        city: 'Mumbai',
      });

      const customer = await User.create({
        fullName: 'Priya Sharma',
        email: 'priya@example.com',
        password: 'priyapassword123',
        phone: '+91 98123 45678',
        role: 'customer',
        city: 'Mumbai',
        address: '402 Sunset Heights, Bandra West, Mumbai',
      });

      const cleaningService = await Service.findOne({ category: 'Home Cleaning' });
      const completedBooking = await Booking.create({
        bookingId: 'MDX-998241',
        customer: customer._id,
        customerInfo: {
          name: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
        },
        service: cleaningService ? cleaningService._id : null,
        serviceTitle: 'Full Home Deep Cleaning',
        assignedWorker: worker._id,
        bookingDate: '2026-10-18',
        timeSlot: '10:00 AM - 12:00 PM',
        proTier: 'Master Specialist',
        customerInstructions: 'Please focus on kitchen and balcony windows.',
        priceBreakdown: {
          basePrice: 1499,
          tierSurcharge: 199,
          discount: 100,
          couponCode: 'WELCOME100',
          total: 1598,
        },
        bookingStatus: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'online',
      });

      await Review.create({
        customer: customer._id,
        customerName: customer.fullName,
        customerLocation: customer.city,
        customerImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80',
        service: cleaningService ? cleaningService._id : null,
        serviceTitle: 'Full Home Deep Cleaning',
        booking: completedBooking._id,
        rating: 5,
        comment: 'Outstanding service! The team arrived on time with industrial equipment and left the whole flat sparkling clean. Super seamless booking!',
      });

      console.log('[Mendx Seed] Seeded admin, worker, customer accounts, and completed booking with review.');
    }
  } catch (seedError) {
    console.error('[Mendx Seed Error]:', seedError.message);
  }
};
