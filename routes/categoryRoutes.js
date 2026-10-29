import express from 'express';
import Service from '../models/Service.js';
import Category from '../models/Category.js';

const router = express.Router();

export const CATEGORIES_DATA = [
  {
    id: 'electrician',
    slug: 'electrician',
    name: 'Electrician',
    title: 'Electrician Services',
    description: 'Electrical repairs, installation, and maintenance.',
    startingPrice: 249,
    startingPriceDisplay: '₹249',
    rating: 4.92,
    reviewsCount: 1480,
    icon: 'Zap',
    badge: 'Certified Pros',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      {
        id: 'electrical-repairs',
        name: 'Electrical Repairs',
        description: 'Troubleshooting and fixing faulty switches, fans, sockets, and tripping fuses.',
        services: [
          {
            id: 'elec-fan-repair',
            name: 'Fan Repair',
            subcategoryId: 'electrical-repairs',
            price: 249,
            duration: '30-45 mins',
            rating: 4.9,
            reviewsCount: 320,
            image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Regulator, capacitor replacement, noise reduction, and speed fixing.',
            fullDescription: 'Comprehensive ceiling or exhaust fan diagnostics. Includes capacitor replacement, blade balancing, regulator repair, and bearing lubrication to eliminate humming noises.',
            included: ['Complete motor and bearing check', 'Capacitor and regulator inspection', 'Speed regulation troubleshooting', '30-day post-service warranty'],
            notIncluded: ['Cost of replacement copper rewinding or new fan body', 'New decorative fan blade sets'],
            keywords: ['fan', 'ceiling fan', 'exhaust fan', 'regulator', 'capacitor', 'noise', 'speed']
          },
          {
            id: 'elec-switch-repair',
            name: 'Switch and Socket Repair',
            subcategoryId: 'electrical-repairs',
            price: 199,
            duration: '30 mins',
            rating: 4.88,
            reviewsCount: 410,
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Sparking socket replacement, burned modular switches, and board rewiring.',
            fullDescription: 'Safe resolution for sparking switches, loose contact sockets, burned modular plates, and faulty ground/earth terminal connections.',
            included: ['Inspection of phase, neutral, and earth terminals', 'Tightening loose connections', 'Replacement of broken switch/socket modules', 'Safety testing with digital multimeter'],
            notIncluded: ['Cost of premium branded switchboard faceplates', 'Main electrical panel overhaul'],
            keywords: ['switch', 'socket', 'plug', 'switchboard', 'sparking', 'board', 'burnt switch']
          },
          {
            id: 'elec-mcb-repair',
            name: 'MCB and Fuse Repair',
            subcategoryId: 'electrical-repairs',
            price: 299,
            duration: '45 mins',
            rating: 4.95,
            reviewsCount: 280,
            image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Frequent MCB tripping diagnostic, sub-meter checks, and fuse replacement.',
            fullDescription: 'Identify the exact branch overload or short-circuit causing frequent MCB breaker trips. Includes replacement of malfunctioning single/double pole MCB units and safety load balancing.',
            included: ['Distribution box circuit inspection', 'Diagnostic load test across all circuits', 'Replacement of faulty MCB/RCCB', 'Phase balancing check'],
            notIncluded: ['Cost of industrial 3-phase heavy RCCB units', 'Rewiring entire home circuits'],
            keywords: ['mcb', 'fuse', 'trip', 'tripping', 'breaker', 'short circuit', 'distribution box']
          },
          {
            id: 'elec-wiring-inspection',
            name: 'Wiring Inspection',
            subcategoryId: 'electrical-repairs',
            price: 349,
            duration: '1 hr',
            rating: 4.91,
            reviewsCount: 195,
            image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Detailed health check of internal conduits, earthing, and insulation.',
            fullDescription: 'Certified electrician inspects internal conduits, concealed wires, electrical load capacity, and earthing resistance to protect home appliances from power surges.',
            included: ['Full apartment earthing & leakage voltage test', 'Thermal scanning for overheated concealed wire junctions', 'Detailed report of safety risks'],
            notIncluded: ['Wall chiseling or concealed conduit replacement', 'Government meter board alterations'],
            keywords: ['wiring', 'wire', 'inspection', 'earthing', 'leakage', 'concealed', 'safety']
          }
        ]
      },
      {
        id: 'installation-services',
        name: 'Installation Services',
        description: 'Precision mounting, wiring connection, and setup for appliances and fixtures.',
        services: [
          {
            id: 'elec-fan-install',
            name: 'Fan Installation',
            subcategoryId: 'installation-services',
            price: 249,
            duration: '45 mins',
            rating: 4.93,
            reviewsCount: 520,
            image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Ceiling fan assembly, downrod fixing, hook mounting, and speed testing.',
            fullDescription: 'Safe unboxing, blade assembly, downrod connection, suspension hook mounting, and electrical connection with speed controller testing.',
            included: ['Ceiling hook inspection and secure shackle fastening', 'Blade alignment and motor balancing', 'Switchboard regulator integration', 'Operational testing across all speeds'],
            notIncluded: ['New ceiling anchor hook drilling if hook missing', 'Concealed wiring extension beyond 1 meter'],
            keywords: ['fan', 'fan install', 'ceiling fan installation', 'mounting']
          },
          {
            id: 'elec-doorbell-install',
            name: 'Doorbell Installation',
            subcategoryId: 'installation-services',
            price: 199,
            duration: '30 mins',
            rating: 4.87,
            reviewsCount: 160,
            image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Wired or wireless smart video doorbell mounting and configuration.',
            fullDescription: 'Doorbell chime mounting, power wire connection, exterior push button placement, and volume chime testing. Supports smart and wireless bells.',
            included: ['Surface mounting on door frame or wall', 'Wiring connection to existing bell point', 'Smart app sync for WiFi video doorbells', 'Sound level verification'],
            notIncluded: ['Wall drilling for fresh concealed chime wiring', 'Doorbell unit hardware cost'],
            keywords: ['doorbell', 'bell', 'chime', 'calling bell', 'video doorbell']
          },
          {
            id: 'elec-inverter-install',
            name: 'Inverter Installation',
            subcategoryId: 'installation-services',
            price: 599,
            duration: '1-2 hrs',
            rating: 4.96,
            reviewsCount: 310,
            image: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Inverter and tubular battery setup with main MCB changeover bypass.',
            fullDescription: 'Professional home inverter and battery connection. Includes acid battery terminal greasing, high-amperage cabling, changeover switch connection, and automatic backup verification.',
            included: ['Heavy-duty battery cabling and terminal anti-corrosion coating', 'AC-DC inverter connection to dedicated sub-circuit', 'Bypass switch configuration for fail-safe power', 'Cut-off and charging voltage calibration'],
            notIncluded: ['Inverter machine or battery unit hardware', 'Trolley cabinet purchase'],
            keywords: ['inverter', 'battery', 'ups', 'power backup', 'changeover']
          }
        ]
      },
      {
        id: 'lighting-solutions',
        name: 'Lighting Solutions',
        description: 'Aesthetic and functional indoor/outdoor lighting fixtures and LED upgrades.',
        services: [
          {
            id: 'elec-light-install',
            name: 'Light Installation',
            subcategoryId: 'lighting-solutions',
            price: 179,
            duration: '30 mins',
            rating: 4.91,
            reviewsCount: 440,
            image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Wall sconces, tube lights, pendant lights, and track lighting setup.',
            fullDescription: 'Mounting of decorative wall lamps, tube fixtures, flush mounts, or ambient pendant lamps with safe junction termination.',
            included: ['Wall bracket drilling and solid wall plug fixing', 'Electrical terminal connection with insulation tape', 'Functional switch testing'],
            notIncluded: ['Cost of chandelier or light fixture', 'Fresh wall groove cutting'],
            keywords: ['light', 'tube light', 'lamp', 'pendant', 'fixture', 'wall light']
          },
          {
            id: 'elec-led-replace',
            name: 'LED Light Replacement',
            subcategoryId: 'lighting-solutions',
            price: 149,
            duration: '20 mins',
            rating: 4.89,
            reviewsCount: 390,
            image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Recessed false-ceiling cob lights, LED panel replacement, and driver fix.',
            fullDescription: 'Replacement of burned LED downlights, concealed false ceiling panel drivers, and strip lights without tearing gypsum drywall.',
            included: ['Safe removal of spring-loaded ceiling light fixtures', 'LED driver voltage testing & replacement', 'Clean snap-fit installation'],
            notIncluded: ['LED lights or replacement drivers', 'False ceiling structural repair'],
            keywords: ['led', 'led panel', 'cob', 'downlight', 'driver', 'false ceiling light']
          }
        ]
      },
      {
        id: 'electrical-maintenance',
        name: 'Electrical Maintenance',
        description: 'Preventive health checks, switchboard servicing, and annual safety audits.',
        services: [
          {
            id: 'elec-switchboard-health',
            name: 'Switchboard Health Check',
            subcategoryId: 'electrical-maintenance',
            price: 299,
            duration: '1 hr',
            rating: 4.94,
            reviewsCount: 220,
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Comprehensive overhaul of up to 5 switchboards in your home.',
            fullDescription: 'Preventive servicing of all room switchboards: screw tightening, dust blowing, replacement of brittle carbonized wires, and earthing continuity tests.',
            included: ['Tightening of all terminal connections in 5 switchboards', 'Cleaning carbon buildup on contact points', 'Verification of ground earthing safety'],
            notIncluded: ['Replacement modular switches'],
            keywords: ['maintenance', 'health check', 'switchboard', 'preventive', 'safety audit']
          }
        ]
      }
    ]
  },
  {
    id: 'plumber',
    slug: 'plumber',
    name: 'Plumber',
    title: 'Plumbing Services',
    description: 'Plumbing repairs, bathroom fittings, and pipe maintenance.',
    startingPrice: 299,
    startingPriceDisplay: '₹299',
    rating: 4.88,
    reviewsCount: 1620,
    icon: 'Droplet',
    badge: 'Quick Fix',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      {
        id: 'plumbing-repairs',
        name: 'Plumbing Repairs',
        description: 'Urgent fixes for dripping taps, burst pipes, and malfunctioning toilet flushes.',
        services: [
          {
            id: 'plumb-tap-repair',
            name: 'Tap Repair',
            subcategoryId: 'plumbing-repairs',
            price: 199,
            duration: '30 mins',
            rating: 4.9,
            reviewsCount: 580,
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Fix dripping faucets, loose spindles, low water flow, and thread leaks.',
            fullDescription: 'Dismantling and repairing leaking mixer taps, bib taps, and pillar taps. Involves washer replacement, cartridge servicing, and Teflon thread sealing.',
            included: ['Disassembly of faucet head and internal spindle', 'Rubber washer and ceramic disc cleaning/replacement', 'High-grade Teflon tape leakproofing', 'Pressure test on hot & cold lines'],
            notIncluded: ['Cost of replacement brass spindle or cartridge', 'New tap unit cost'],
            keywords: ['tap', 'faucet', 'leak', 'dripping', 'spindle', 'washer', 'tap repair', 'mixer']
          },
          {
            id: 'plumb-pipe-leak',
            name: 'Pipe Leakage Repair',
            subcategoryId: 'plumbing-repairs',
            price: 349,
            duration: '45-60 mins',
            rating: 4.87,
            reviewsCount: 490,
            image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Repair punctured CPVC, PVC, GI pipes, loose elbows, and wall seepage.',
            fullDescription: 'Fast diagnosis and sealing of leaking exposed or semi-concealed plumbing pipes, joint elbows, union couplings, and angle stopcocks.',
            included: ['Identification of exact crack or faulty joint', 'Cutting and splicing with fresh pipe coupling & solvent cement', 'Static water pressure leak test'],
            notIncluded: ['Civil masonry and ceramic tile replacement work', 'Main building vertical riser pipe replacement'],
            keywords: ['pipe', 'leak', 'leakage', 'pipe repair', 'burst pipe', 'joint', 'seepage', 'cpvc']
          },
          {
            id: 'plumb-flush-repair',
            name: 'Toilet Flush Repair',
            subcategoryId: 'plumbing-repairs',
            price: 299,
            duration: '45 mins',
            rating: 4.89,
            reviewsCount: 380,
            image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Fix overflowing cisterns, push buttons, siphon valves, and ball valves.',
            fullDescription: 'Repair of concealed or external toilet cisterns. Fix continuous water overflow into the bowl, stuck push buttons, faulty inlet float valves, and flush flappers.',
            included: ['Cistern cover removal and internal mechanism tuning', 'Inlet valve scale descaling and float arm adjustment', 'Siphon flapper seal replacement or realignment', 'Overflow stop verification'],
            notIncluded: ['Complete new cistern tank hardware', 'Wall-hung concealed carrier structural work'],
            keywords: ['flush', 'toilet', 'cistern', 'commode', 'flush repair', 'flush tank', 'overflow']
          }
        ]
      },
      {
        id: 'bathroom-plumbing',
        name: 'Bathroom Plumbing',
        description: 'Installation and servicing of sanitary ware, washbasins, and overhead showers.',
        services: [
          {
            id: 'plumb-washbasin-install',
            name: 'Washbasin Installation',
            subcategoryId: 'bathroom-plumbing',
            price: 499,
            duration: '1-1.5 hrs',
            rating: 4.92,
            reviewsCount: 290,
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Countertop or wall-hung washbasin mounting, waste pipe, and bottle trap setup.',
            fullDescription: 'Accurate wall bracket drilling, ceramic sink mounting, waste coupling installation, bottle trap connection to drain, and silicone edge waterproofing.',
            included: ['Level marking and wall anchor bolting', 'Waste coupling and flexible pipe connection', 'Silicone bead application along wall joint', 'Drainage flow verification'],
            notIncluded: ['Granite slab cutting for undermount sinks', 'Washbasin hardware purchase'],
            keywords: ['washbasin', 'sink', 'basin', 'bathroom sink', 'bottle trap', 'washbasin installation']
          },
          {
            id: 'plumb-shower-install',
            name: 'Shower Installation',
            subcategoryId: 'bathroom-plumbing',
            price: 299,
            duration: '30-45 mins',
            rating: 4.9,
            reviewsCount: 340,
            image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Rain showerhead, hand shower, shower arm, and divertor fitting.',
            fullDescription: 'Mounting of overhead shower arms, rain heads, hand shower slides, and connecting to hot & cold mixer or diverter valves.',
            included: ['Shower arm thread seal and tightening', 'Nozzle pressure balance and spray direction check', 'Hand shower wall dock installation'],
            notIncluded: ['Shower glass partition installation', 'Concealed diverter body piping within brick wall'],
            keywords: ['shower', 'rain shower', 'hand shower', 'showerhead', 'bathroom fitting', 'shower installation']
          }
        ]
      },
      {
        id: 'kitchen-plumbing',
        name: 'Kitchen Plumbing',
        description: 'Sink fittings, drain unclogging, dishwasher/purifier water lines.',
        services: [
          {
            id: 'plumb-sink-install',
            name: 'Sink Installation',
            subcategoryId: 'kitchen-plumbing',
            price: 549,
            duration: '1-2 hrs',
            rating: 4.91,
            reviewsCount: 260,
            image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Stainless steel/quartz kitchen sink installation with drain line clamping.',
            fullDescription: 'Drop-in or top-mount kitchen sink installation. Includes waste coupling fitting, P-trap installation, connection to main drain, and leak-proof perimeter silicone sealing.',
            included: ['Drop-in sink placement and leveling', 'Heavy-duty waste coupling with strainer', 'Trap connection to drain pipe', 'High-grade anti-fungal silicone seal'],
            notIncluded: ['Granite or quartz countertop cutting', 'Kitchen sink unit cost'],
            keywords: ['sink', 'kitchen sink', 'sink installation', 'kitchen plumbing', 'waste coupling', 'p-trap']
          },
          {
            id: 'plumb-drain-blockage',
            name: 'Drain Blockage Removal',
            subcategoryId: 'kitchen-plumbing',
            price: 399,
            duration: '45 mins',
            rating: 4.95,
            reviewsCount: 610,
            image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Unclog choked kitchen sink pipes, floor traps, and accumulated grease.',
            fullDescription: 'Mechanical snake cable and eco chemical treatment to clear stubborn food solids, grease buildup, and sludge choking kitchen sink drain pipes and floor traps.',
            included: ['Manual snake cable unclogging up to 15 feet', 'Trap dismantling and grease removal', 'Hot flush and drain flow verification'],
            notIncluded: ['Motorized high-pressure sewer jetting for main municipal line'],
            keywords: ['drain', 'blockage', 'clog', 'unclog', 'choke', 'sink choked', 'drainage']
          }
        ]
      },
      {
        id: 'plumbing-maintenance',
        name: 'Installation and Maintenance',
        description: 'Routine water tank cleaning, tap installation, and pipeline checkups.',
        services: [
          {
            id: 'plumb-tap-install',
            name: 'Tap Installation',
            subcategoryId: 'plumbing-maintenance',
            price: 199,
            duration: '30 mins',
            rating: 4.88,
            reviewsCount: 420,
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Mount new bathroom or kitchen taps, bib cocks, and pillar taps.',
            fullDescription: 'Clean removal of old worn taps and leak-free mounting of new designer taps with Teflon sealing and thread protection.',
            included: ['Old tap removal without damaging internal wall threads', 'New tap installation with wall flange', 'Teflon sealant application and water flow test'],
            notIncluded: ['Cost of new tap hardware'],
            keywords: ['tap', 'tap install', 'faucet', 'bib cock', 'pillar tap', 'tap installation']
          },
          {
            id: 'plumb-water-tank',
            name: 'Water Tank Cleaning',
            subcategoryId: 'plumbing-maintenance',
            price: 799,
            duration: '2-3 hrs',
            rating: 4.94,
            reviewsCount: 310,
            image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
            shortDescription: '6-stage mechanized cleaning and disinfection for rooftop or loft tanks.',
            fullDescription: 'Deep cleaning of residential overhead water tanks up to 1,000L. Includes dewatering, sludge vacuuming, high-pressure jet wash, anti-bacterial spray, and UV disinfection.',
            included: ['Mechanized sludge and sediment extraction', 'High-pressure rotary wall jet wash', 'Potassium permanganate sanitization', 'Tank outlet filter inspection'],
            notIncluded: ['Underground concrete sump tanks exceeding 2,000L'],
            keywords: ['water tank', 'tank cleaning', 'overhead tank', 'tank wash']
          },
          {
            id: 'plumb-pipeline-inspection',
            name: 'Water Pipeline Inspection',
            subcategoryId: 'plumbing-maintenance',
            price: 349,
            duration: '1 hr',
            rating: 4.86,
            reviewsCount: 180,
            image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Pressure check, hidden seepage detection, and air-lock bleeding.',
            fullDescription: 'Comprehensive assessment of home plumbing network: water pressure testing at all outlets, air lock bleeding, and moisture check for concealed pipelines.',
            included: ['Pressure measurement at top and bottom outlets', 'Air-lock bleeding from overhead supply lines', 'Visual inspection of exposed pipelines and valves'],
            notIncluded: ['Thermal imaging camera diagnostics'],
            keywords: ['pipeline', 'inspection', 'pressure', 'air lock', 'plumbing check', 'seepage']
          }
        ]
      }
    ]
  },
  {
    id: 'salon',
    slug: 'salon',
    name: 'Salon & Beauty',
    title: 'Salon & Beauty Services',
    description: 'Haircuts, hair styling, facials, waxing, and beauty treatments.',
    startingPrice: 499,
    startingPriceDisplay: '₹499',
    rating: 4.94,
    reviewsCount: 2890,
    icon: 'Scissors',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      {
        id: 'hair-services',
        name: 'Hair Services',
        description: 'Professional precision cuts, blow dry styling, and restorative hair spa therapies.',
        services: [
          {
            id: 'salon-women-haircut',
            name: "Women's Haircut",
            subcategoryId: 'hair-services',
            price: 499,
            duration: '45 mins',
            rating: 4.95,
            reviewsCount: 920,
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Consultation, precision layered/bob cut, hair wash, and blow-dry finish.',
            fullDescription: 'Personalized hair cut by senior stylist tailored to your face shape. Includes hair consultation, precision section cutting, texturizing, and styling blow-dry.',
            included: ['Detailed face-shape hair consultation', 'Precision sectioning and customized cut', 'Thermal blow-dry styling', 'Disposable cape and sanitized shears'],
            notIncluded: ['Hair coloring or highlights', 'Keratin smoothing treatments'],
            keywords: ['haircut', 'women haircut', 'hair cut', 'hair style', 'trim', 'bob cut']
          },
          {
            id: 'salon-men-haircut',
            name: "Men's Haircut",
            subcategoryId: 'hair-services',
            price: 299,
            duration: '30 mins',
            rating: 4.91,
            reviewsCount: 780,
            image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Clipper fade or scissor trim, neck cleaning, and styling pomade.',
            fullDescription: 'Clean clipper taper/fade or classic scissor cut with sanitized cordless trimmer, razor neck clean, and natural hair wax styling.',
            included: ['Scissor and clipper haircut of choice', 'Neck line taper with single-use blade', 'Post-cut styling cream finish', 'Clean workstation cleanup'],
            notIncluded: ['Beard spa and shaping'],
            keywords: ['men haircut', 'fade', 'taper', 'haircut men', 'hair trim']
          },
          {
            id: 'salon-hair-styling',
            name: 'Hair Styling',
            subcategoryId: 'hair-services',
            price: 599,
            duration: '45-60 mins',
            rating: 4.88,
            reviewsCount: 340,
            image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Party blow-dry, soft Hollywood curls, straightening, or elegant braids.',
            fullDescription: 'Professional event styling using ceramic curling wands and straighteners with premium anti-frizz serums and flexible hold spray.',
            included: ['Heat protection spray application', 'Curling, straightening, or textured waves', 'Bobby pins and styling hold spray'],
            notIncluded: ['Bridal heavy floral updo extensions'],
            keywords: ['styling', 'blow dry', 'curls', 'ironing', 'straightening', 'party hair']
          },
          {
            id: 'salon-hair-spa',
            name: 'Hair Spa',
            subcategoryId: 'hair-services',
            price: 899,
            duration: '60 mins',
            rating: 4.97,
            reviewsCount: 510,
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Nourishing cream masque, 20-min acupressure head massage, and hot towel steam.',
            fullDescription: 'Deep conditioning treatment to restore moisture to damaged, frizzy, or chemically treated hair. Includes relaxing head massage and steam infusion.',
            included: ['Argan or Keratin nourishing hair masque', '20-minute rhythmic scalp acupressure massage', 'Hot towel steam therapy to open cuticles', 'Serum leave-in blow dry'],
            notIncluded: ['Hair color touch-up'],
            keywords: ['hair spa', 'head massage', 'spa', 'deep conditioning', 'frizzy hair']
          }
        ]
      },
      {
        id: 'facial-skincare',
        name: 'Facial and Skin Care',
        description: 'Rejuvenating organic facials, deep pore cleansing, and glowing skin treatments.',
        services: [
          {
            id: 'salon-basic-facial',
            name: 'Basic Facial',
            subcategoryId: 'facial-skincare',
            price: 699,
            duration: '45 mins',
            rating: 4.9,
            reviewsCount: 650,
            image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Cleansing, mild exfoliation, herbal cream massage, and soothing face pack.',
            fullDescription: 'Revitalizing routine facial for instant freshness. Removes accumulated dead skin cells, restores natural moisture, and relaxes facial muscles.',
            included: ['Double cleansing with fruit extract wash', 'Gentle walnut micro-scrub exfoliation', '15-minute face and neck massage', 'Brightening clay mask and SPF'],
            notIncluded: ['Blackhead comedone extraction machine', 'Chemical peel treatments'],
            keywords: ['facial', 'basic facial', 'face clean', 'glow', 'skin care', 'fruit facial']
          },
          {
            id: 'salon-deep-facial',
            name: 'Deep Cleansing Facial',
            subcategoryId: 'facial-skincare',
            price: 1199,
            duration: '60 mins',
            rating: 4.96,
            reviewsCount: 820,
            image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Pore steaming, blackhead extraction, vitamin C massage, and rubber peel-off mask.',
            fullDescription: 'Clinical-grade deep cleansing facial for congested skin. Employs herbal warm steam, vacuum pore suction/extractor, collagen serum, and alginate rubber mask.',
            included: ['Warm steam to soften blackheads', 'Painless blackhead & whitehead extraction', 'Vitamin C brightening serum infusion', 'Cooling rubber peel-off algae mask'],
            notIncluded: ['Laser dermatological resurfacing'],
            keywords: ['deep cleansing', 'facial', 'blackhead', 'steaming', 'glow facial', 'vitamin c']
          }
        ]
      },
      {
        id: 'waxing',
        name: 'Waxing',
        description: 'Hygienic cartridge and peel-off waxing for smooth, hair-free skin.',
        services: [
          {
            id: 'salon-full-arms-wax',
            name: 'Full Arms Waxing',
            subcategoryId: 'waxing',
            price: 349,
            duration: '30 mins',
            rating: 4.92,
            reviewsCount: 710,
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Gentle honey or Rica wax for full arms, underarms, and knuckles.',
            fullDescription: 'Zero-mess waxing using disposable strips and hypoallergenic wax formulation. Includes full arms up to shoulders and underarms, finished with soothing aloe vera gel.',
            included: ['Pre-wax cleansing and talc application', 'Full arms including fingers and elbows', 'Complimentary underarms waxing', 'Post-wax calming aloe vera massage'],
            notIncluded: ['Full body waxing'],
            keywords: ['waxing', 'arms wax', 'full arms waxing', 'underarms', 'rica wax']
          },
          {
            id: 'salon-full-legs-wax',
            name: 'Full Legs Waxing',
            subcategoryId: 'waxing',
            price: 499,
            duration: '40 mins',
            rating: 4.93,
            reviewsCount: 680,
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Quick, painless hair removal for full legs including knees and feet.',
            fullDescription: 'Silky smooth leg waxing from thighs down to toes with temperature-controlled heater, high-adhesion non-sticky wax, and ingrown hair preventative lotion.',
            included: ['Pre-wax skin sanitization', 'Upper thigh to toe coverage', 'Disposable spatulas and wax strips', 'Soothing post-wax oil'],
            notIncluded: ['Bikini waxing'],
            keywords: ['waxing', 'legs wax', 'full legs waxing', 'smooth skin']
          }
        ]
      },
      {
        id: 'manicure-pedicure',
        name: 'Manicure and Pedicure',
        description: 'Relaxing foot soaks, cuticle care, heel exfoliation, and nail polish.',
        services: [
          {
            id: 'salon-manicure',
            name: 'Manicure',
            subcategoryId: 'manicure-pedicure',
            price: 499,
            duration: '40 mins',
            rating: 4.89,
            reviewsCount: 460,
            image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Warm soak, cuticle trimming, hand scrub, massage, and nail shaping.',
            fullDescription: 'Pampering hand care with rose salt soak, dead skin exfoliation, cuticle softening, therapeutic hand & forearm massage, and natural nail buffing.',
            included: ['Warm floral water hand soak', 'Nail clipping, filing, and cuticle pushback', 'Exfoliating botanical hand scrub', 'Moisturizing hand cream massage'],
            notIncluded: ['Gel acrylic nail extensions'],
            keywords: ['manicure', 'nails', 'hand spa', 'cuticle', 'nail polish']
          },
          {
            id: 'salon-pedicure',
            name: 'Pedicure',
            subcategoryId: 'manicure-pedicure',
            price: 599,
            duration: '45 mins',
            rating: 4.94,
            reviewsCount: 590,
            image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Heel scrubbing, callus smoothing, foot reflexology massage, and polish.',
            fullDescription: 'Ultimate foot rejuvenation with bubbling foot tub soak, pumice callus descaling, revitalizing peppermint scrub, and reflexology pressure point foot massage.',
            included: ['Epsom salt & tea tree warm foot soak', 'Callus scraping and heel dead skin removal', 'Peppermint foot scrub', 'Deep relaxing foot massage'],
            notIncluded: ['Medical podiatry corn surgery'],
            keywords: ['pedicure', 'foot spa', 'heel care', 'callus', 'foot massage']
          }
        ]
      }
    ]
  },
  {
    id: 'bathroom',
    slug: 'bathroom',
    name: 'Bathroom Cleaning',
    title: 'Bathroom Cleaning & Sanitization',
    description: 'Bathroom deep cleaning, toilet cleaning, tile cleaning, and sanitization.',
    startingPrice: 499,
    startingPriceDisplay: '₹499',
    rating: 4.91,
    reviewsCount: 2150,
    icon: 'Bath',
    badge: 'High Demand',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      {
        id: 'bathroom-deep-cleaning',
        name: 'Deep Cleaning',
        description: 'Complete top-to-bottom scrub down of tiles, fixtures, floors, and exhaust vents.',
        services: [
          {
            id: 'bath-complete-deep',
            name: 'Complete Bathroom Deep Cleaning',
            subcategoryId: 'bathroom-deep-cleaning',
            price: 499,
            duration: '1-1.5 hrs',
            rating: 4.94,
            reviewsCount: 1240,
            image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Full mechanized scrubbing of tiles, WC, washbasin, chrome, and exhaust.',
            fullDescription: 'Comprehensive deep cleaning for your entire bathroom. Uses eco-safe descaling compounds to dissolve yellow stains, limescale on tiles, soap scum on shower glass, and sanitizes sanitary ware.',
            included: ['Mechanized rotary scrubbing of floor and wall tiles', 'Hard water stain removal on shower glass & taps', 'Toilet pot descaling inside and out with sanitization', 'Mirror buffing and exhaust fan cleaning'],
            notIncluded: ['Tile re-grouting or silicone sealant reapplication'],
            keywords: ['bathroom', 'deep cleaning', 'washroom', 'toilet cleaning', 'bath clean', 'stain removal']
          },
          {
            id: 'bath-floor-cleaning',
            name: 'Bathroom Floor Cleaning',
            subcategoryId: 'bathroom-deep-cleaning',
            price: 299,
            duration: '30-45 mins',
            rating: 4.88,
            reviewsCount: 420,
            image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Intensive mechanized scrubbing of slippery, mossy, or stained floor tiles.',
            fullDescription: 'Targeted heavy scrubbing for floor tiles and drainage corners. Removes slippery soap residues, calcified deposits, and mold from grout lines.',
            included: ['Heavy-duty floor tile degreasing and stain lift', 'Grout line manual brush scrubbing', 'Drain trap hair removal and chemical flush'],
            notIncluded: ['Wall tiles or ceiling cleaning'],
            keywords: ['floor cleaning', 'bathroom floor', 'tile scrub', 'grout', 'slippery floor']
          }
        ]
      },
      {
        id: 'fixture-cleaning',
        name: 'Fixture Cleaning',
        description: 'Sparkling restoration of chrome faucets, ceramic washbasins, and toilet bowls.',
        services: [
          {
            id: 'bath-toilet-washbasin',
            name: 'Toilet and Washbasin Cleaning',
            subcategoryId: 'fixture-cleaning',
            price: 349,
            duration: '45 mins',
            rating: 4.91,
            reviewsCount: 530,
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Intensive descaling of Western/Indian commode, cistern, and washbasin.',
            fullDescription: 'Targeted germ eradication and scale removal on both the toilet pot and ceramic washbasin. Restores original glossy white shine without scratching porcelain glaze.',
            included: ['Toilet bowl rim, jet spray, and flush tank descaling', 'Washbasin bowl and chrome waste coupling polishing', 'Antibacterial sanitization wipe-down'],
            notIncluded: ['Wall tile scrubbing'],
            keywords: ['toilet cleaning', 'washbasin', 'commode', 'pot cleaning', 'basin wash', 'toilet']
          },
          {
            id: 'bath-shower-faucet',
            name: 'Shower and Faucet Cleaning',
            subcategoryId: 'fixture-cleaning',
            price: 249,
            duration: '30 mins',
            rating: 4.9,
            reviewsCount: 380,
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Shine restoration for chalky chrome fixtures, mixer taps, and showerheads.',
            fullDescription: 'Non-corrosive chemical descaling to melt stubborn calcium hard water deposits from chrome plated taps, bib cocks, diverters, and overhead shower nozzles.',
            included: ['Chrome fixture descaling paste treatment', 'Showerhead nozzle declogging for uniform spray', 'Microfiber buff to mirror finish'],
            notIncluded: ['Replating worn-off chrome finish'],
            keywords: ['faucet', 'shower cleaning', 'tap shine', 'chrome polish', 'descaling']
          },
          {
            id: 'bath-mirror-cleaning',
            name: 'Mirror Cleaning',
            subcategoryId: 'fixture-cleaning',
            price: 149,
            duration: '20 mins',
            rating: 4.87,
            reviewsCount: 220,
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Streak-free mirror descaling and glass shelf deep cleaning.',
            fullDescription: 'Removes water spots, dried soap splashes, and toothpaste haze from bathroom vanity mirrors and glass shelving for crystal clarity.',
            included: ['Glass descaling spray application', 'Squeegee wipe and lint-free microfiber buffing', 'Glass shelf bracket wiping'],
            notIncluded: ['Silvering damage behind mirror'],
            keywords: ['mirror', 'glass cleaning', 'mirror cleaning', 'streak free', 'vanity']
          }
        ]
      },
      {
        id: 'tile-surface-cleaning',
        name: 'Tile and Surface Cleaning',
        description: 'Hard water stain removal, tile descaling, and grout whitening.',
        services: [
          {
            id: 'bath-tile-scrub',
            name: 'Bathroom Tile Scrubbing',
            subcategoryId: 'tile-surface-cleaning',
            price: 399,
            duration: '45-60 mins',
            rating: 4.92,
            reviewsCount: 470,
            image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Deep wall tile scrubbing to remove yellow soap film, dirt, and mildew.',
            fullDescription: 'Rotary motorized machine scrubbing of all four walls of your bathroom. Leaves ceramic, porcelain, or vitrified tiles bright and clean.',
            included: ['Wall tile alkaline spray and dwell time', 'Rotary high-speed brush pass', 'Water jet rinse and rubber squeegee dry'],
            notIncluded: ['Marble polishing'],
            keywords: ['tile scrubbing', 'tiles', 'wall tiles', 'bathroom tiles', 'grout cleaning']
          },
          {
            id: 'bath-hardwater-stain',
            name: 'Hard Water Stain Removal',
            subcategoryId: 'tile-surface-cleaning',
            price: 449,
            duration: '1 hr',
            rating: 4.96,
            reviewsCount: 680,
            image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Specialized chemical compound to dissolve heavy limescale crust on tiles and glass.',
            fullDescription: 'Professional grade limescale dissolver specifically formulated for Indian borewell and hard municipal water mineral deposits. Treats shower cubicles, partitions, and floor corners.',
            included: ['Application of heavy-duty mineral acid compound', 'Manual abrasive pad agitation on stubborn deposits', 'Protective water repellent wax coating'],
            notIncluded: ['Permanent chemical etching marks on natural marble'],
            keywords: ['hard water', 'stain removal', 'limescale', 'calcium', 'shower glass stain']
          }
        ]
      },
      {
        id: 'bathroom-sanitization',
        name: 'Sanitization',
        description: 'Hospital-grade antimicrobial misting to eliminate 99.9% germs and bacteria.',
        services: [
          {
            id: 'bath-sanitization-full',
            name: 'Bathroom Sanitization',
            subcategoryId: 'bathroom-sanitization',
            price: 299,
            duration: '30 mins',
            rating: 4.93,
            reviewsCount: 390,
            image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'ULV cold mist fogging with certified disinfectant for 100% germ-free bathroom.',
            fullDescription: 'Eliminates bacteria, viruses, E. coli, and persistent bathroom odor using non-toxic food-contact safe biocide aerosol fogging.',
            included: ['Targeted spray on door handles, flushes, and faucets', 'ULV fogging across entire bathroom enclosure', 'Long-lasting anti-microbial residual barrier'],
            notIncluded: ['Physical scrubbing of dirt or mud'],
            keywords: ['sanitization', 'disinfection', 'germ free', 'fogging', 'odor removal']
          }
        ]
      }
    ]
  },
  {
    id: 'kitchen',
    slug: 'kitchen',
    name: 'Kitchen Services',
    title: 'Kitchen Services & Deep Cleaning',
    description: 'Kitchen deep cleaning, chimney cleaning, appliance cleaning, and kitchen maintenance.',
    startingPrice: 599,
    startingPriceDisplay: '₹599',
    rating: 4.93,
    reviewsCount: 1980,
    icon: 'ChefHat',
    badge: 'Top Rated',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      {
        id: 'kitchen-deep-cleaning',
        name: 'Kitchen Deep Cleaning',
        description: 'Floor-to-ceiling mechanized cleaning and degreasing of all cooking surfaces.',
        services: [
          {
            id: 'kitchen-complete-deep',
            name: 'Complete Kitchen Deep Cleaning',
            subcategoryId: 'kitchen-deep-cleaning',
            price: 899,
            duration: '2-3 hrs',
            rating: 4.95,
            reviewsCount: 1120,
            image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Intensive degreasing of slab, cabinets, tiles, chimney exterior, and sink.',
            fullDescription: 'Intensive kitchen transformation. Removes sticky yellow oil residue from wall tiles, countertop slabs, cabinet exterior laminates, exhaust vents, and stainless steel sinks.',
            included: ['Oil degreasing spray on tiles, slab, and cabinets', 'Chimney exterior wipe and mesh filter dip', 'Sink descaling and P-trap disinfection', 'Floor mechanized scrubbing'],
            notIncluded: ['Emptying cabinet interior utensils'],
            keywords: ['kitchen deep cleaning', 'kitchen clean', 'degreasing', 'oil removal', 'complete kitchen']
          },
          {
            id: 'kitchen-tile-cleaning',
            name: 'Kitchen Tile Cleaning',
            subcategoryId: 'kitchen-deep-cleaning',
            price: 399,
            duration: '45 mins',
            rating: 4.89,
            reviewsCount: 340,
            image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Hot steam and foam degreasing of grease-coated splashback wall tiles.',
            fullDescription: 'Targeted heavy scrubbing behind gas stoves and chimneys where oil vapor hardens into sticky yellow grime. Restores glossy tile finish and grout cleanliness.',
            included: ['Food-safe foam degreaser dwell application', 'Steam agitation to melt sticky oil layers', 'Microfiber streak-free drying'],
            notIncluded: ['Full kitchen floor or cabinets'],
            keywords: ['tile cleaning', 'kitchen tiles', 'splashback', 'grease on tiles', 'oil tiles']
          }
        ]
      },
      {
        id: 'chimney-services',
        name: 'Chimney Services',
        description: 'Filter degreasing, motor blower deep cleaning, and duct inspection.',
        services: [
          {
            id: 'kitchen-chimney-cleaning',
            name: 'Chimney Cleaning',
            subcategoryId: 'chimney-services',
            price: 599,
            duration: '1-1.5 hrs',
            rating: 4.96,
            reviewsCount: 890,
            image: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Mesh/baffle filter chemical boiling, oil collector wash, and blower clean.',
            fullDescription: 'Dismantling of baffle or mesh filters and oil collection trays with caustic soak to completely liquefy thick accumulated cooking grease. Restores full kitchen suction power.',
            included: ['Dismantling and soaking baffle/mesh filters in hot degreasing bath', 'Oil cup tray wash and cleaning', 'Chimney hood exterior buffing', 'Suction motor operational test'],
            notIncluded: ['New aluminum flexible duct pipe replacement', 'Motor replacement'],
            keywords: ['chimney', 'chimney cleaning', 'suction', 'baffle filter', 'oil collector']
          },
          {
            id: 'kitchen-exhaust-fan',
            name: 'Exhaust Fan Cleaning',
            subcategoryId: 'chimney-services',
            price: 249,
            duration: '30 mins',
            rating: 4.88,
            reviewsCount: 290,
            image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Remove thick greasy sludge from kitchen exhaust fan blades and louvers.',
            fullDescription: 'Disassembly of oily exhaust fan blades, outer mesh grill, and motor frame. Restores ventilation speed and eliminates burning grease odors.',
            included: ['Blade detachment and soak in degreaser', 'Motor body wipe without water contact', 'Reassembly and vibration check'],
            notIncluded: ['New exhaust fan unit'],
            keywords: ['exhaust fan', 'exhaust cleaning', 'kitchen fan', 'fan blades', 'ventilation']
          }
        ]
      },
      {
        id: 'appliance-cleaning',
        name: 'Appliance Cleaning',
        description: 'Sanitizing gas stoves, refrigerator exteriors, and microwave ovens.',
        services: [
          {
            id: 'kitchen-gas-stove',
            name: 'Gas Stove Cleaning',
            subcategoryId: 'appliance-cleaning',
            price: 299,
            duration: '30 mins',
            rating: 4.91,
            reviewsCount: 450,
            image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Brass burner unclogging, pan support descaling, and glass top shine.',
            fullDescription: 'Intensive descaling of 2, 3, or 4 burner gas stoves. Soaks brass burners to clear blocked flame orifices, removes burnt food residue from drip trays, and polishes toughened glass surfaces.',
            included: ['Brass burner soaking in carbon-dissolving solution', 'Heavy pan support wire brush scrubbing', 'Glass top degreasing and dial cleaning', 'Uniform blue flame verification'],
            notIncluded: ['Gas leakage regulator hose replacement'],
            keywords: ['gas stove', 'stove cleaning', 'burner', 'cooktop', 'gas top', 'hob cleaning']
          },
          {
            id: 'kitchen-fridge-exterior',
            name: 'Refrigerator Exterior Cleaning',
            subcategoryId: 'appliance-cleaning',
            price: 249,
            duration: '30 mins',
            rating: 4.87,
            reviewsCount: 310,
            image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Fingerprint removal, rubber door gasket mold disinfection, and shine.',
            fullDescription: 'Thorough sanitization of refrigerator exterior body, handles, condenser coil dust removal, and deep cleaning of mildew from magnetic rubber door gaskets.',
            included: ['Door surface streak-free wipe', 'Rubber gasket anti-fungal treatment', 'Back condenser dust vacuuming'],
            notIncluded: ['Interior deep defrosting'],
            keywords: ['refrigerator', 'fridge', 'fridge exterior', 'gasket cleaning', 'appliance clean']
          },
          {
            id: 'kitchen-microwave-cleaning',
            name: 'Microwave Cleaning',
            subcategoryId: 'appliance-cleaning',
            price: 249,
            duration: '30 mins',
            rating: 4.9,
            reviewsCount: 280,
            image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Steam cavity degreasing, glass turntable wash, and deodorization.',
            fullDescription: 'Natural citrus steam explosion to soften baked-on food splatters inside the microwave cavity. Followed by glass turntable wash and sanitization.',
            included: ['Interior steam degreasing cycle', 'Turntable plate and roller ring wash', 'Door glass cleaning inside and out'],
            notIncluded: ['Electronic heating element repairs'],
            keywords: ['microwave', 'oven', 'microwave cleaning', 'otg', 'baking oven']
          }
        ]
      },
      {
        id: 'sink-surface-maintenance',
        name: 'Sink and Surface Maintenance',
        description: 'Hard water scale removal from stainless steel sinks and heavy grease extraction.',
        services: [
          {
            id: 'kitchen-sink-clean',
            name: 'Kitchen Sink Cleaning',
            subcategoryId: 'sink-surface-maintenance',
            price: 249,
            duration: '30 mins',
            rating: 4.92,
            reviewsCount: 390,
            image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Stainless steel sink descaling, drain odor flush, and faucet shine.',
            fullDescription: 'Restores brilliant metallic luster to stainless steel or granite composite sinks. Dissolves hard water film, cleans strainer basket, and neutralizes drain trap odors.',
            included: ['Stainless steel descaling paste buff', 'Strainer cup and overflow drain brush scrub', 'Hot citrus flush for drain freshness'],
            notIncluded: ['Under-sink pipe leakage repair'],
            keywords: ['sink', 'kitchen sink', 'sink cleaning', 'strainer', 'drain clean']
          },
          {
            id: 'kitchen-grease-oil-stain',
            name: 'Grease and Oil Stain Removal',
            subcategoryId: 'sink-surface-maintenance',
            price: 349,
            duration: '45 mins',
            rating: 4.94,
            reviewsCount: 460,
            image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
            shortDescription: 'Dissolve stubborn aged yellow oil build-up on granite countertops and edges.',
            fullDescription: 'Targeted extraction of tough oxidized cooking oil films from kitchen countertops, cabinet handles, and tile corners using bio-enzymatic degreasers.',
            included: ['Bio-degreaser spray and dwell time', 'Scrubbing with non-scratch nylon pads', 'Surface rinse and buff with dry microfiber'],
            notIncluded: ['Granite stone diamond repolishing'],
            keywords: ['grease', 'oil stain', 'sticky oil', 'degreasing', 'oil removal', 'stain clean']
          }
        ]
      }
    ]
  }
];

// Helper to ensure MongoDB has all 5 primary categories and subservices
export const ensureCategoriesInDB = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(CATEGORIES_DATA);
      console.log('[Mendx MongoDB] Seeded 5 primary categories and subservices into MongoDB.');
    }
  } catch (err) {
    console.error('[Category Seed Error]:', err.message);
  }
};

// @route   GET /api/categories
// @desc    Fetch the five primary categories from MongoDB
// @access  Public
router.get('/', async (req, res) => {
  try {
    let categories = await Category.find().lean();
    if (!categories || categories.length === 0) {
      await ensureCategoriesInDB();
      categories = await Category.find().lean();
    }
    const dataToUse = categories && categories.length > 0 ? categories : CATEGORIES_DATA;
    const summary = dataToUse.map((cat) => ({
      _id: cat._id,
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      title: cat.title,
      description: cat.description,
      shortDescription: cat.description,
      startingPrice: cat.startingPrice,
      startingPriceDisplay: cat.startingPriceDisplay,
      rating: cat.rating,
      reviewsCount: cat.reviewsCount,
      icon: cat.icon,
      badge: cat.badge,
      image: cat.image,
      heroImage: cat.image,
      subcategoriesCount: cat.subcategories?.length || 0,
      servicesCount: cat.subcategories?.reduce((acc, sub) => acc + (sub.services?.length || 0), 0) || 0,
    }));

    res.json({
      success: true,
      count: summary.length,
      categories: summary,
      source: 'mongodb',
    });
  } catch (error) {
    console.error('[Categories Fetch Error]:', error);
    const summary = CATEGORIES_DATA.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      title: cat.title,
      description: cat.description,
      startingPrice: cat.startingPrice,
      startingPriceDisplay: cat.startingPriceDisplay,
      rating: cat.rating,
      reviewsCount: cat.reviewsCount,
      icon: cat.icon,
      badge: cat.badge,
      image: cat.image,
      subcategoriesCount: cat.subcategories.length,
      servicesCount: cat.subcategories.reduce((acc, sub) => acc + sub.services.length, 0),
    }));
    res.json({
      success: true,
      count: summary.length,
      categories: summary,
      source: 'fallback',
    });
  }
});

// @route   GET /api/categories/:slug/services
// @desc    Fetch subcategories and services for a category from MongoDB
// @access  Public
router.get('/:slug/services', async (req, res) => {
  const { slug } = req.params;
  try {
    let category = await Category.findOne({
      $or: [{ slug: slug.toLowerCase() }, { id: slug.toLowerCase() }]
    }).lean();

    if (!category) {
      await ensureCategoriesInDB();
      category = await Category.findOne({
        $or: [{ slug: slug.toLowerCase() }, { id: slug.toLowerCase() }]
      }).lean();
    }

    if (!category) {
      category = CATEGORIES_DATA.find(
        (c) => c.slug.toLowerCase() === slug.toLowerCase() || c.id.toLowerCase() === slug.toLowerCase()
      );
    }

    if (!category) {
      return res.status(404).json({ error: `Category '${slug}' not found.` });
    }

    res.json({
      success: true,
      category: {
        _id: category._id,
        id: category.id,
        slug: category.slug,
        name: category.name,
        title: category.title,
        description: category.description,
        startingPrice: category.startingPrice,
        startingPriceDisplay: category.startingPriceDisplay,
        rating: category.rating,
        reviewsCount: category.reviewsCount,
        icon: category.icon,
        badge: category.badge,
        image: category.image,
        subcategories: category.subcategories,
      },
      source: 'mongodb',
    });
  } catch (err) {
    console.error('[Category Services Fetch Error]:', err);
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

export default router;
