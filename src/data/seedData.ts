import { countWords } from '../lib/mediaUtils';
import type {
  BlogPost,
  CmsPage,
  Listing,
  MenuItem,
  ServiceOffering,
  SiteContent,
} from '../types/purecrest';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'purecresthospitality@gmail.com';

export const LOGO_ASSET_PATH = '/assets/purecrest-logo.png';

export const ASSET_IMAGE_PRESETS = [
  {
    label: 'Flagship Penthouse Suite',
    url: '/src/assets/images/hero_lagos_penthouse_1794819192829.jpg',
  },
  {
    label: 'Luxury Detached Residence',
    url: '/src/assets/images/property_ikoyi_residence_1794819193481.jpg',
  },
  {
    label: 'Richgates Executive Suite',
    url: '/src/assets/images/shortlet_vi_suite_1794819194303.jpg',
  },
  {
    label: 'Hospitality Concierge Lounge',
    url: '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
  },
  {
    label: 'Smart Commercial Atrium',
    url: '/src/assets/images/tech_smart_building_1794819195524.jpg',
  },
];

export const DEFAULT_MENUS: MenuItem[] = [
  { id: 'menu-home', label: 'Home', target: '/', placement: 'both', order: 1, visible: true },
  { id: 'menu-about', label: 'About', target: '/about', placement: 'both', order: 2, visible: true },
  { id: 'menu-listings', label: 'Listings', target: '/listings', placement: 'both', order: 3, visible: true },
  { id: 'menu-services', label: 'Services', target: '/services', placement: 'both', order: 4, visible: true },
  { id: 'menu-journal', label: 'Journal', target: '/journal', placement: 'both', order: 5, visible: true },
  { id: 'menu-contact', label: 'Contact', target: '/contact', placement: 'both', order: 6, visible: true },
];

export const DEFAULT_SITE_CONTENT: SiteContent = {
  id: 'main',
  sectionKey: 'main',
  brandName: 'PureCrest',
  logoUrl: LOGO_ASSET_PATH,
  heroEyebrow: 'PURECREST HOSPITALITY, REAL ESTATE & TECHNOLOGY',
  heroTitle: 'Your Property. Our Management. Better Hospitality.',
  heroSubtitle:
    'We partner with hotel proprietors, shortlet operators, and real estate owners across Nigeria to professionally manage, reposition, and grow their hospitality assets — delivering seamless guest stays, verified sales and leasing, OTA optimization, and smart booking systems.',
  heroPrimaryCta: 'Browse Shortlets',
  heroSecondaryCta: 'Contact Us',
  heroImageUrl: '/src/assets/images/hero_lagos_penthouse_1794819192829.jpg',
  aboutImageUrl: '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
  listingsHeroImageUrl: '/src/assets/images/shortlet_vi_suite_1794819194303.jpg',
  servicesHeroImageUrl: '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
  journalHeroImageUrl: '/src/assets/images/tech_smart_building_1794819195524.jpg',
  contactHeroImageUrl: '/src/assets/images/property_ikoyi_residence_1794819193481.jpg',
  partnerBannerImageUrl: '/src/assets/images/property_ikoyi_residence_1794819193481.jpg',
  aboutHeadline: 'Creating spaces and experiences that stand the test of time.',
  aboutBody:
    'Operating from Abuja, Federal Capital Territory, PureCrest unifies hospitality operations, curated shortlet management (including client properties such as Richgates Hotels and Apartments in Enugu), residential and commercial sales and leasing, remote virtual support, OTA listing optimization, and intelligent property software.',
  statPropertiesManaged: 'PureCrest Portfolio',
  statOccupancyRate: 'Verified Operations',
  statCitiesActive: 'Abuja · Enugu · Nationwide',
  statEnterpriseClients: 'PureCrest Partners',
  contactEmail: 'hello@purecrest.ng',
  contactPhone: '+234 913 040 3970',
  officeAddress: 'Abuja, Federal Capital Territory, Nigeria',
  announcementBanner: '',
  officeHoursWeekday: '8:00 AM – 6:00 PM',
  officeHoursSaturday: '9:00 AM – 4:00 PM',
  officeHoursSunday: 'By Appointment',
  menus: DEFAULT_MENUS,
  updatedBy: 'system',
};

export const DEFAULT_PAGES: CmsPage[] = [
  {
    id: 'home',
    slug: 'home',
    navLabel: 'Home',
    title: 'PureCrest — Hospitality Management, Shortlets, Real Estate & PropTech',
    eyebrow: 'PURECREST HOSPITALITY, REAL ESTATE & TECHNOLOGY',
    headline: 'Your Property. Our Management. Better Hospitality.',
    subtitle:
      'Integrated hospitality management, curated client shortlets, verified real estate brokerage, remote virtual support, OTA optimization, and smart property software.',
    heroImageUrl: '/src/assets/images/hero_lagos_penthouse_1794819192829.jpg',
    body: 'PureCrest partners with asset owners, developers, and hospitality operators across Nigeria to elevate guest experience, maximize net yields, and modernize property operations.',
    sections: [
      {
        id: 'home-sec-1',
        title: 'Institutional Hospitality & Property Stewardship',
        body: 'From boutique hotels and airport-corridor shortlets to commercial leases and custom booking software, every PureCrest mandate follows structured engineering, financial transparency, and attentive guest care.',
        imageUrl: '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
        ctaLabel: 'Learn About PureCrest',
        ctaTarget: '/about',
      },
    ],
    seoTitle: 'PureCrest — Hospitality Management, Shortlets & Real Estate Nigeria',
    seoDescription:
      'Hospitality management, curated client shortlets, verified property sales and leasing, virtual support, OTA optimization, and smart booking systems across Nigeria.',
    published: true,
    showInMenu: true,
    menuOrder: 1,
    updatedBy: 'system',
  },
  {
    id: 'about',
    slug: 'about',
    navLabel: 'About',
    title: 'About PureCrest',
    eyebrow: 'OUR FIRM · ABUJA HEAD OFFICE',
    headline: 'Creating spaces and experiences that stand the test of time.',
    subtitle:
      'Based in Abuja, Federal Capital Territory, PureCrest bridges institutional hospitality management, real estate transactions, and modern property technology for owners across Nigeria.',
    heroImageUrl: '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
    body: `PureCrest was established to bring institutional operational rigor to hospitality and real estate management in Nigeria. Operating from our corporate office in Abuja, Federal Capital Territory, we work alongside hotel proprietors, independent serviced apartment owners, residential developers, and corporate organizations to turn physical buildings into reliable, high-performing hospitality assets.

Our client portfolio spans managed shortlet hospitality residences such as Richgates Hotels and Apartments in Enugu — which we operate and market as a premier shortlet client property — alongside residential sales, corporate leasing, OTA ranking optimization, remote hospitality virtual support, and proprietary direct-booking infrastructure.

Every engagement is anchored on three non-negotiable standards: transparent owner reporting, proactive preventive engineering, and hotel-grade guest hospitality.`,
    sections: [
      {
        id: 'about-hospitality',
        title: 'Operational Excellence for Partner Properties',
        body: 'We do not treat managed residences as passive listings. Our team implements room-by-room readiness checklists, hybrid power and Wi-Fi monitoring, multi-channel calendar synchronization, and 24-hour guest care — allowing independent properties like our client shortlet Richgates Hotels and Apartments in Enugu to deliver consistent five-star stays.',
        imageUrl: '/src/assets/images/shortlet_vi_suite_1794819194303.jpg',
        ctaLabel: 'Browse Managed Shortlets',
        ctaTarget: '/listings',
      },
      {
        id: 'about-property-tech',
        title: 'Verified Real Estate & Smart Technology',
        body: 'Beyond hospitality stays, PureCrest handles statutory title verification, residential and commercial sales, corporate leasing, custom booking websites, and digital operations tools built for modern property teams.',
        imageUrl: '/src/assets/images/tech_smart_building_1794819195524.jpg',
        ctaLabel: 'Explore Our Services',
        ctaTarget: '/services',
      },
    ],
    seoTitle: 'About PureCrest | Hospitality, Property & PropTech Firm in Abuja',
    seoDescription:
      'Learn about PureCrest, headquartered in Abuja, FCT — delivering hotel management, client shortlet operations, real estate brokerage, virtual support, and booking technology.',
    published: true,
    showInMenu: true,
    menuOrder: 2,
    updatedBy: 'system',
  },
  {
    id: 'listings',
    slug: 'listings',
    navLabel: 'Listings',
    title: 'Properties & Managed Client Shortlets',
    eyebrow: 'CURATED PORTFOLIO · CLIENT SHORTLETS & VERIFIED ASSETS',
    headline: 'Residences, Managed Shortlets & Commercial Assets',
    subtitle:
      'Explore managed client shortlets including Richgates Hotels and Apartments in Enugu, alongside verified residences and commercial properties available for stay, sale, or lease.',
    heroImageUrl: '/src/assets/images/shortlet_vi_suite_1794819194303.jpg',
    body: 'Every residence presented by PureCrest undergoes facility verification, room-tier accuracy auditing, and transparent pricing validation. Select any property to inspect room options, view media galleries, or submit a reservation or private viewing request.',
    sections: [],
    seoTitle: 'Listings & Shortlets | PureCrest Properties',
    seoDescription:
      'Browse executive shortlets such as Richgates Hotels and Apartments in Enugu alongside verified residences and commercial properties across Nigeria.',
    published: true,
    showInMenu: true,
    menuOrder: 3,
    updatedBy: 'system',
  },
  {
    id: 'services',
    slug: 'services',
    navLabel: 'Services',
    title: 'PureCrest Services & Divisions',
    eyebrow: 'INTEGRATED SERVICE DIVISIONS',
    headline: 'Dedicated Hospitality, Property, Virtual Support, OTA Optimization & Software Services',
    subtitle:
      'Explore each dedicated service division operated by PureCrest — structured for hotel owners, shortlet hosts, and real estate stakeholders across Nigeria.',
    heroImageUrl: '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
    body: 'PureCrest combines five specialized operating desks under one unified partner relationship so asset owners never have to coordinate fragmented contractors.',
    sections: [],
    seoTitle: 'Services — Hospitality, Property, Virtual Support, OTA & Tech | PureCrest',
    seoDescription:
      'Hotel management, shortlet operations, real estate sales & leasing, OTA listing optimization, hospitality virtual support, and smart booking software.',
    published: true,
    showInMenu: true,
    menuOrder: 4,
    updatedBy: 'system',
  },
  {
    id: 'journal',
    slug: 'journal',
    navLabel: 'Journal',
    title: 'PureCrest Journal',
    eyebrow: 'RESEARCH & FIELD BRIEFINGS',
    headline: 'Hospitality Economics, Title Governance & PropTech Briefings',
    subtitle:
      'In-depth operational essays, engineering guides, and OTA distribution strategies authored for property owners and hospitality operators.',
    heroImageUrl: '/src/assets/images/tech_smart_building_1794819195524.jpg',
    body: 'Our editorial briefings share practical frameworks developed across live hotel turnarounds, serviced apartment operations, utility telemetry deployments, and direct booking rollouts.',
    sections: [],
    seoTitle: 'PureCrest Journal — Hospitality, Real Estate & PropTech Insights',
    seoDescription:
      'Long-form research and operational briefings on serviced shortlets, OTA optimization, hospitality virtual support, and smart building systems.',
    published: true,
    showInMenu: true,
    menuOrder: 5,
    updatedBy: 'system',
  },
  {
    id: 'contact',
    slug: 'contact',
    navLabel: 'Contact',
    title: 'Contact Us',
    eyebrow: 'PURECREST CORPORATE DESK · ABUJA, FCT',
    headline: 'Contact Us',
    subtitle:
      "We'd love to hear from you. Reach out for enquiries about our hospitality management, client shortlets, property brokerage, or technology services.",
    heroImageUrl: '/src/assets/images/property_ikoyi_residence_1794819193481.jpg',
    body: 'Visit us, call us, or send a direct message — our team responds promptly within one business day.',
    sections: [],
    seoTitle: 'Contact PureCrest | Abuja Office, Email & Direct Enquiries',
    seoDescription:
      'Contact PureCrest in Abuja, Federal Capital Territory, Nigeria for hospitality management, client shortlets, property sales, and OTA optimization enquiries.',
    published: true,
    showInMenu: true,
    menuOrder: 6,
    updatedBy: 'system',
  },
];

export const DEFAULT_LISTINGS: Listing[] = [
  {
    id: 'richgates-hotels-and-apartments-enugu',
    title: 'Richgates Hotels and Apartments, Enugu',
    category: 'shortlet',
    propertyType: 'Apartment',
    location: 'Thinkers Corner, Enugu (Client Shortlet Property)',
    address: 'Plot C/16-C, Fabian Okafor Close, Airport Road Extension, Thinkers Corner, Enugu',
    priceNgn: 91000,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 120,
    maxGuests: 6,
    summary:
      'Featured shortlet client property in Enugu 1 km from Akanu Ibiam Intl Airport — serviced suites & multi-bedroom apartments with equipped kitchens, free Wi-Fi, private parking, fitness center, bar, and 24/7 front desk.',
    description:
      'Operated as a premier shortlet client property on PureCrest, Richgates Hotels and Apartments is situated at Plot C/16-C, Fabian Okafor Close, Airport Road Extension, Thinkers Corner, Enugu (approximately 1 km from Akanu Ibiam International Airport). Accommodations include studio suites and multi-bedroom serviced apartments designed for business, transit, and family stays. Suites feature air conditioning, flat-screen Smart TVs, work desks, wardrobes, seating and dining areas, private bathrooms with shower, bathtub, bidet, hairdryer, and free toiletries, plus equipped kitchens or kitchenettes with refrigerator, freezer, microwave, gas cooker, electric kettle, smoke extractor, and washing machine. Guests enjoy free Wi-Fi throughout, free on-site private parking, garden-view balconies, fitness center, on-site bar and lounge, continental breakfast options, and 24-hour front desk and room service. Standard check-in opens from 2:00 PM with check-out by 12:00 PM; pets and parties are not permitted.',
    amenities: [
      'Free Wi-Fi Throughout',
      'Free On-Site Private Parking',
      '24-Hour Front Desk & Room Service',
      'Equipped Kitchen & Microwave',
      'Fitness Center & On-Site Bar',
      '1 km to Enugu Airport',
      'Air Conditioning & Flat-Screen TV',
      'Check-In 2:00 PM · Check-Out 12:00 PM',
    ],
    imageUrl: '/src/assets/images/shortlet_vi_suite_1794819194303.jpg',
    galleryImages: [
      '/src/assets/images/shortlet_vi_suite_1794819194303.jpg',
      '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
      '/src/assets/images/hero_lagos_penthouse_1794819192829.jpg',
    ],
    videoUrl: '',
    rooms: [
      {
        id: 'richgates-enugu-deluxe-studio',
        name: 'Deluxe Studio Suite',
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        pricePerNightNgn: 91000,
        amenities: [
          'Air Conditioning & Work Desk',
          'Flat-Screen TV & Free Wi-Fi',
          'Kitchenette, Fridge & Kettle',
          'Shower, Bathtub & Toiletries',
        ],
        galleryImages: [
          '/src/assets/images/shortlet_vi_suite_1794819194303.jpg',
          '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
        ],
        videoUrl: '',
        available: true,
      },
      {
        id: 'richgates-enugu-1bed-apartment',
        name: 'One-Bedroom Serviced Apartment',
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        pricePerNightNgn: 120000,
        amenities: [
          'Separate Parlor & Living Area',
          'Full Kitchen, Microwave & Cooker',
          'Garden-View Balcony & Wardrobe',
          'Washing Machine & Free Wi-Fi',
        ],
        galleryImages: [
          '/src/assets/images/shortlet_vi_suite_1794819194303.jpg',
          '/src/assets/images/hero_lagos_penthouse_1794819192829.jpg',
        ],
        videoUrl: '',
        available: true,
      },
      {
        id: 'richgates-enugu-2bed-apartment',
        name: 'Two-Bedroom Executive Apartment',
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        pricePerNightNgn: 175000,
        amenities: [
          '2 Bedrooms & Separate Parlor',
          'Full Kitchen, Fridge & Freezer',
          'Dining Area & Private Balcony',
          '24-Hour Room Service & Parking',
        ],
        galleryImages: [
          '/src/assets/images/hero_lagos_penthouse_1794819192829.jpg',
          '/src/assets/images/shortlet_vi_suite_1794819194303.jpg',
        ],
        videoUrl: '',
        available: true,
      },
      {
        id: 'richgates-enugu-3bed-apartment',
        name: 'Three-Bedroom Luxury Residence',
        bedrooms: 3,
        bathrooms: 3,
        maxGuests: 6,
        pricePerNightNgn: 245000,
        amenities: [
          '3 En-Suite Bedrooms & Lounge',
          'Full Kitchen & Smoke Extractor',
          'Fitness Center & Bar Access',
          '24-Hour Front Desk & Security',
        ],
        galleryImages: [
          '/src/assets/images/hero_lagos_penthouse_1794819192829.jpg',
          '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
        ],
        videoUrl: '',
        available: true,
      },
    ],
    featured: true,
    status: 'available',
    authorId: 'system',
  },
];

const FLAGSHIP_ARTICLE_1 = `Across Abuja, Enugu, and Nigeria’s fastest-growing hospitality corridors, the economics of residential and commercial real estate have shifted decisively away from passive landlordism toward active hospitality operations. Property owners who once relied exclusively on annual residential leases are discovering that professionally managed serviced residences and multi-room executive shortlets deliver substantially higher net operating income when paired with disciplined engineering, transparent accounting, and hotel-grade guest stewardship. Yet capturing that yield consistently requires far more than furnishing an apartment and listing it online. It demands an institutional operating framework capable of bridging physical asset care with modern property technology.

The Structural Shift Toward Serviced Hospitality Across Nigeria

Corporate travelers, diplomatic delegations, diaspora families, and project consultants moving across Abuja, Enugu, Port Harcourt, and regional transit hubs expect predictability above everything else. Traditional boutique hotels often struggle with cramped floor plans for multi-week assignments, rigid dining schedules, and inconsistent broadband capacity. Conversely, unstandardized peer-to-peer shortlets frequently suffer from erratic power transitions, delayed maintenance response, opaque check-in procedures, and inconsistent housekeeping standards. PureCrest was structured from its Abuja corporate base specifically to close that operational gap by combining the spatial comfort of private architectural residences with the service reliability of an institutional hospitality operator.

In growth centers anchored by aviation gateways such as Thinkers Corner near Akanu Ibiam International Airport in Enugu, as well as diplomatic and commercial districts across Abuja, demand has bifurcated sharply between unbranded units competing purely on nightly discounts and professionally operated client properties capable of commanding sustained year-round occupancy. Corporate travel desks and multinational procurement teams increasingly require verified safety compliance, audited invoicing, guaranteed dual-ISP internet redundancy, and uninterrupted power availability before approving accommodations for visiting executives. Properties that meet these benchmarks retain repeat corporate accounts across quarters rather than relying solely on seasonal leisure spikes.

Multi-Room Inventory Architecture and Yield Optimization

One of the highest-leverage mechanisms in modern urban hospitality is flexible multi-room inventory design. Rather than locking a large multi-bedroom residence into a single rigid nightly price, well-designed floor plans allow operators to commercialize individual studio suites alongside one-bedroom, two-bedroom, and three-bedroom serviced apartments depending on seasonal demand and booking lead times. During midweek corporate travel windows, solo visiting executives and two-person advisory teams often prefer booking a Deluxe Studio Suite or One-Bedroom Serviced Apartment with dedicated work desks, high-speed internet, and private kitchenettes. Over weekends, conferences, or family holidays, larger groups reserve multi-bedroom wings with shared dining areas and garden-view balconies.

At PureCrest, dynamic rate modeling balances single-suite occupancy against multi-bedroom availability so revenue per available room climbs without sacrificing guest privacy. Every room tier maintains dedicated check-in protocols, separate housekeeping checklists, tailored amenity kits, and independent climate controls. When guests select an individual room tier inside a managed client property such as Richgates Hotels and Apartments in Enugu, booking systems automatically reflect suite-specific capacities, amenities, and transparent nightly tariffs.

Power Economics, Hybrid Microgrids, and Preventive Engineering

In hospitality management across Nigeria, utility reliability is the single greatest determinant of both guest satisfaction scores and net owner returns. Running diesel generators continuously without load optimization erodes operating margins rapidly and introduces mechanical fatigue across alternators and cooling compressors. Institutional asset stewardship treats power generation as an engineered system rather than an afterthought.

Our engineering audits begin by mapping baseline thermal loads across air conditioning units, water heaters, booster pumps, laundry equipment, and kitchen appliances. By pairing lithium-iron-phosphate battery banks and solar arrays with automated generator synchronization and smart circuit shedding, well-calibrated residences cut fuel consumption dramatically while eliminating the brief voltage transfer flickers that disrupt video conferences and damage sensitive appliances. Preventive maintenance schedules—covering quarterly chiller descaling, weekly transfer-switch diagnostics, water filtration checks, smoke extractor servicing, and moisture inspections—prevent minor wear from escalating into emergency room closures during peak occupancy weeks.

Title Due Diligence and Institutional Asset Protection

For diaspora owners and family offices acquiring properties across Nigeria specifically for hospitality operations or long-term capital preservation, acquisition discipline precedes operational performance. A residence with superior architectural finishes cannot function as a bankable asset if its statutory documentation carries unresolved encumbrances. Every acquisition or development mandate handled through PureCrest’s property desk undergoes layered verification: tracing root of title at the state land registry, confirming statutory Certificate of Occupancy or Governor’s Consent validity, auditing building plan approvals against actual structural footprints, and verifying service-charge governance inside multi-unit estates.

Equally critical is structuring clear management agreements that align operator incentives with long-term asset preservation. Owners deserve line-of-sight visibility into gross booking receipts, OTA and direct-channel commission splits, utility sub-metering expenses, preventive maintenance reserves, and capital expenditure approvals. Opaque flat-fee deductions without itemized telemetry invite distrust; audited monthly owner statements backed by live portal metrics build multi-year institutional partnerships across every region we serve.

The Role of Property Technology in Eliminating Revenue Leakage

Technology inside hospitality and real estate only creates durable value when it solves concrete operational bottlenecks on the ground. In serviced apartments and multi-tenant commercial buildings, revenue leakage typically hides in four places: unrecorded cash extensions at reception, untraceable diesel and grid power consumption, delayed maintenance ticketing, and fragmented booking calendars across direct web channels and international travel agencies.

Deploying a unified property operating layer addresses all four vulnerabilities simultaneously. Time-bound digital access codes issued upon verified reservation confirmation eliminate unauthorized room occupancy, because doors and portals reflect exact paid booking windows. IoT utility sub-meters measure kilowatt-hour consumption per suite and per commercial floor plate in real time, flagging anomalous overnight HVAC draws or generator inefficiencies within minutes. Meanwhile, direct booking platforms with instant date-range calculators, multi-room selection, and verified customer portals capture corporate repeat bookings without sacrificing eighteen-percent intermediary commissions on every returning stay.

Designing for Longevity: Architecture, Acoustics, and Interior Materiality

Beyond software and engineering, guests remember how a space feels during the quiet moments between flights and meetings. High-turnover shortlets decorated with fragile mass-market furniture age poorly within twelve months, driving up replacement capital expenditure and depressing review ratings. PureCrest advises developers and property owners to specify commercial-grade hospitality materials from day one: sealed porcelain surfaces that resist tropical humidity, solid hardwood joinery, blackout acoustic drapery, high-thread-count hotel percale linens, full kitchen appliances engineered for daily turnover, and layered warm architectural lighting that transitions effortlessly from daytime workspace clarity to evening relaxation.

Acoustic insulation and serene landscaping deserve equal attention. Quiet garden-view balconies, double-glazed windows near airport corridors, private gated parking, and clean 24-hour front-desk hospitality elevate transit and extended-stay properties into preferred sanctuaries for returning business and family travelers.

Looking Ahead: Building Transparent Hospitality Institutions

Nigeria’s hospitality and real estate ecosystem is maturing rapidly while connecting more closely with diaspora owners and international travelers. Capital continues to gravitate toward managers who demonstrate verifiable governance, engineering rigor, architectural taste, and software transparency. Whether repositioning an independent boutique hotel, scaling a managed client residence in Enugu, managing corporate leases in Abuja, or coordinating virtual hospitality support for partners nationwide, integrated execution outperforms fragmented contracting every time. At PureCrest, our commitment remains focused on measurable performance for asset owners, effortless stays for guests, and enduring technical standards across every property carrying our stewardship.`;

const FLAGSHIP_ARTICLE_2 = `Commercial office complexes, gated residential estates, and boutique serviced apartment buildings across Abuja, Enugu, and major urban markets share a common operational challenge: utility and security management often consumes up to forty percent of gross operating budgets while still relying on manual logbooks, paper visitor slips, and reactive repairs. As energy tariffs fluctuate and institutional stakeholders demand transparent governance, legacy building management practices have become financially unsustainable. Transitioning to connected building telemetry and unified digital portals is no longer an experimental luxury for modern developments—it is the foundation of competitive asset performance.

Why Legacy Estate and Facility Management Breaks Down at Scale

In a conventional multi-unit serviced apartment block or multi-tenant commercial building, facility managers spend most of their week reconciling fragmented spreadsheets. Security teams record visitor arrivals in handwritten ledgers that cannot be searched during compliance audits. Generator operators log fuel deliveries and runtime hours manually on clipboards, leaving management teams guessing whether high monthly power bills stem from genuine guest consumption, cooling inefficiencies, or fuel pilferage. Maintenance technicians receive repair requests across scattered messaging threads with no SLA tracking, causing recurring plumbing or electrical faults to go unnoticed until major equipment fails.

These manual blind spots hurt every stakeholder. Tenants and shortlet guests resent unpredictable billing or unexpected maintenance disruptions. Property owners suffer depressed net yields and accelerated depreciation of mechanical plants. Hospitality staff burn administrative hours reconciling paperwork rather than proactively elevating guest care.

Smart Metering and Real-Time Energy Intelligence

The cornerstone of PureCrest’s technology division is real-time utility telemetry engineered specifically for hybrid power environments, where hospitality buildings routinely switch between public grid supply, solar-battery inverters, and backup generators. By installing industrial IoT sub-meters across distribution boards and individual apartments or office suites, building operators gain second-by-second visibility into voltage stability, phase balance, and exact kilowatt-hour usage segmented by power source.

Instead of dividing fuel bills arbitrarily by square meterage—a practice that penalizes energy-conscious tenants—automated billing engines calculate precise tariff-weighted consumption for every unit. When an office suite leaves central air conditioning running over a public holiday or a vacant shortlet apartment exhibits abnormal nighttime draw, automated threshold alerts notify building engineers immediately. Across properties equipped with smart telemetry, surfacing granular load patterns and eliminating idle mechanical runtimes consistently lowers energy waste within the first ninety days of deployment while extending generator and inverter lifespan.

Keyless Access Control and Digital Visitor Orchestration

Physical security across hospitality and residential developments must balance strict perimeter verification with frictionless arrival for approved guests, residents, and corporate visitors. Long queues at reception desks, late-night key handovers after delayed flights, and lost mechanical keys create unnecessary friction while weakening auditability.

Modern PropTech access infrastructure replaces static keys and paper passes with time-bound digital credentials. When a guest confirms a shortlet reservation or a corporate partner schedules an arrival through PureCrest, the system can provision an encrypted PIN or QR pass valid strictly within the authorized time window and restricted solely to designated wings and suites. Every entry event logs cleanly to a secure access trail, giving hospitality security teams instant verification while respecting guest privacy. Should a guest extend their stay by three nights or adjust check-out timing, access permissions update automatically without anyone needing to visit the property physically to rekey locks.

Preventive Maintenance Workflows and Asset Lifecycle Telemetry

Mechanical downtime rarely happens without warning signs. Rising generator coolant temperatures, frequent inverter overload trips, subtle drops in water booster pressure, and anomalous HVAC compressor amperage all precede hardware failure by days or weeks. Connecting plant checklists and technician mobile workflows into a single maintenance ledger turns emergency firefighting into scheduled engineering.

Every PureCrest-operated building maintains a digital asset registry tracking serial numbers, warranty dates, filter replacement intervals, and technician sign-off photos for every chiller, lift, water treatment plant, kitchen appliance, and solar inverter. Preventive work orders generate automatically based on runtime hours and room turnover cycles rather than calendar guesswork. For asset owners monitoring their properties remotely from Abuja, Enugu, London, or North America, this translates into verifiable confidence that capital equipment is protected with engineering discipline.

Direct Booking Engines and Unified Owner Portals

For hospitality operators and residential developers monetizing shortlet inventory, exclusive dependency on third-party listing marketplaces introduces heavy commission drag and zero ownership of guest relationships. While global OTAs provide essential top-of-funnel discovery, resilient hospitality businesses systematically convert repeat corporate travelers and referral traffic onto owned digital infrastructure.

A modern hospitality web platform must pair clean architectural presentation with instant utility: clear multi-room unit breakdowns, transparent pricing calculators, verified calendar requests, and intuitive navigation where returning guests review residences and submit service inquiries. Simultaneously, the underlying CMS empowers internal operations teams to publish new residences, update nightly rates, upload high-resolution photography and video walkthroughs, and respond to corporate inquiries in seconds without waiting on external developers.

Security, Data Privacy, and Cloud Resilience

Running real estate and hospitality operations in the cloud demands strict adherence to data isolation and uptime resilience. Guest contact records, booking histories, and proprietary financial metrics represent sensitive personally identifiable information. Role-based access rules must enforce strict boundaries at the database layer—ensuring customers only access their own reservations while administrators operate under verified authentication and structured audit rules.

Deploying the web layer onto globally distributed edge networks such as Cloudflare Pages guarantees sub-second page delivery for visitors across Nigeria, Europe, and North America, ensuring diaspora property owners and international travelers experience crisp responsiveness regardless of regional bandwidth conditions. By unifying architectural care, disciplined hospitality stewardship, and resilient cloud software, PureCrest sets a modern operating standard for property businesses.

Phased Deployment Roadmap for Existing Estates and Hospitality Buildings

Property owners do not need to halt operations or demolish existing infrastructure to modernize building workflows. PureCrest’s technology rollout proceeds in three structured phases over four to six weeks. Phase one covers electrical panel auditing, telemetry planning, and network gateway installation without interrupting guest stays. Phase two integrates digital booking pipelines, administrative workflows, and optional smart access locks across priority suites. Phase three activates automated CMS publishing, real-time owner reporting, and staff preventive checklists—delivering clarity and measurable operational discipline from month one onward.`;

const FLAGSHIP_ARTICLE_3 = `For hotel proprietors, serviced apartment owners, and shortlet operators across Abuja, Enugu, and commercial centers throughout Nigeria, visibility on global Online Travel Agencies is often the fastest catalyst for sustained occupancy growth. Platforms such as Airbnb, Booking.com, Vrbo, Expedia, and Google Hotels aggregate millions of high-intent travelers every day who actively search for verified accommodations with transparent pricing, reliable power, workspace readiness, and clean check-in standards. Yet simply uploading basic mobile photos and a generic description rarely captures top-of-page search placement. Mastering OTA listing optimization—and pairing it with a direct booking engine—is what separates consistently booked hospitality properties from underperforming inventory.

How OTA Search Algorithms Evaluate Hospitality Listings

Every major booking marketplace relies on multi-factor ranking algorithms designed to maximize completed stays and minimize guest cancellations or complaints. Whether a traveler searches on Booking.com for airport-accessible serviced apartments in Enugu or browses Airbnb for multi-bedroom corporate stays in Abuja, the platform scores listings across four core dimensions: click-through relevance, conversion velocity, calendar freshness, and post-stay review reliability.

Click-through relevance begins with headline engineering and lead photography. Generic titles such as "Nice 2-Bedroom Apartment" waste valuable search real estate. High-converting titles immediately surface anchor differentiators that match traveler intent: proximity to major aviation or commercial hubs, room configuration, dedicated workspace or fast Wi-Fi, backup power reliability, and architectural style. Paired with a bright, properly composed cover photograph shot in natural light, search impressions convert into listing page views at markedly higher rates.

Content Completeness and Structured Amenity Tagging

On Booking.com and Expedia in particular, incomplete extranet property profiles silently suppress search visibility. Travelers frequently apply strict filter checkboxes before browsing results—filtering for free private parking, air conditioning, full kitchens, washing machines, 24-hour front desk support, Wi-Fi, fitness access, or family rooms. When an operator fails to tag every single amenity accurately at both the property level and the individual suite level, the listing vanishes from filtered searches even when the physical property provides every requested feature.

PureCrest’s OTA Listing Optimization audits inspect every configuration screen across Airbnb, Booking.com, Vrbo, and Google Hotels. For multi-suite client properties like Richgates Hotels and Apartments in Enugu, each accommodation category—from Deluxe Studio Suites to Three-Bedroom Residences—must carry accurate bed configurations, exact bathroom counts, maximum guest occupancy rules, kitchen appliance inventories, and clear house policies covering check-in windows and noise standards. Clear, verifiable property descriptions reduce pre-booking anxiety and cut unnecessary support messages before arrival.

Visual Sequencing and Room-Level Transparency

Travelers booking online evaluate hospitality quality visually within their first ten seconds on a page. Disorganized photo galleries—mixing blurry vertical snapshots, duplicated hallway angles, or unclear room pairings—lower booking confidence and trigger bounce behavior that harms algorithmic ranking.

Strategic visual sequencing tells a clear arrival story. The opening three images establish hero interior design, spacious living comfort, and restful bedroom quality. Subsequent frames verify clean bathroom fixtures, equipped kitchenettes or full kitchens, dedicated work desks, dining areas, balconies, building exteriors, fitness spaces, and safe on-site parking. When properties offer multiple room tiers, mapping dedicated galleries and optional video walkthroughs to each suite prevents expectation mismatches at check-in, which in turn protects review scores from avoidable deductions.

Dynamic Rate Parity, Seasonal Rules, and Cancellation Calibration

Pricing strategy across OTAs requires continuous calibration rather than static yearly numbers. Setting rates blindly too high stalls booking velocity and pushes listings onto page three; underpricing attracts high-wear short-stay traffic while leaving significant revenue uncaptured during conferences, festive holidays, and corporate peak windows.

Effective revenue optimization coordinates base nightly rates across studios and multi-bedroom suites while implementing smart length-of-stay discounts, advance-purchase tiers, and mobile-rate promotions where appropriate. Equally vital is maintaining strict rate parity and synchronized availability across every connected OTA and your own direct booking website. Nothing damages guest trust or platform standing faster than double bookings or stale calendars. Automated channel coordination keeps inventory synchronized in real time while ensuring direct web bookings offer transparent rates and streamlined corporate invoicing.

Bridging OTA Discovery into Direct Repeat Reservations

While global OTAs excel at introducing first-time visitors to a property, paying recurring platform commissions on every repeat corporate traveler or returning diaspora family unnecessarily compresses operating margins. PureCrest structures OTA optimization as the front door of a balanced two-stage funnel: first maximizing search rank and conversion on third-party travel portals, and then delivering an exceptional on-site stay backed by a branded direct website.

When guests experience seamless airport proximity, responsive 24-hour front desk hospitality, spotless housekeeping, and reliable broadband during their initial OTA booking, clear digital collateral and transparent direct-booking convenience encourage subsequent trips, team relocations, and group bookings to flow straight through your owned booking platform. Over twelve months, shifting even thirty percent of repeat demand into direct channels transforms property profitability without sacrificing occupancy volume.

Managing Direct Guest Expectations Through Automated Pre-Arrival Communication

Consistent five-star review scores on Airbnb, Booking.com, and Expedia do not begin when a guest opens their bedroom door; they begin the moment a reservation confirmation hits their inbox. Unanswered logistical questions regarding airport shuttle availability, late-evening check-in procedures, parking access codes, or backup power hours cause unnecessary friction that colors a traveler’s entire stay experience before arrival.

Through PureCrest’s OTA Listing Optimization workflow, every connected channel delivers structured pre-arrival messaging milestones automatically: an immediate welcome note confirming suite selection and directions, a forty-eight-hour pre-arrival checklist verifying arrival window and vehicle registration, and a mid-stay check-in ping enabling housekeeping or engineering teams to resolve minor requests while the guest is still on property. This disciplined communication cadence consistently lowers pre-arrival cancellations, eliminates gate delays, and increases review completion rates by verified travelers.

Continuous Performance Audits and Listing Hygiene

OTA algorithms reward operational consistency. Fast inquiry response times, accurate check-in instructions, proactive maintenance of appliances, structured seasonal calendar updates, and thoughtful responses to every verified guest review signal institutional reliability to both marketplace algorithms and prospective travelers. Properties that neglect periodic content refreshes gradually slip down search result pages as newer competing inventory enters the market.

Through PureCrest’s ongoing OTA optimization service, property owners gain quarterly listing audits, keyword and headline refinements aligned with shifting seasonal demand, competitive rate benchmarking across neighboring districts, and refreshed gallery sequencing whenever suites are upgraded. By uniting disciplined channel engineering with reliable on-site hospitality delivery, independent properties establish enduring visibility and healthy year-round occupancy.`;

const FLAGSHIP_ARTICLE_4 = `Managing a hotel, boutique guesthouse, or multi-unit shortlet portfolio demands constant operational responsiveness across time zones, holidays, and late-night flight arrivals. Yet many independent property owners, diaspora landlords, and growing hospitality operators struggle to sustain a dedicated twenty-four-hour reservations and operations office without inflating fixed payroll overhead. Hospitality Virtual Support solves this structural bottleneck by providing seasoned remote operations teams who manage guest communication, booking calendars, revenue coordination, and on-ground vendor dispatch for client properties across Nigeria and international hospitality desks.

The Hidden Operational Cost of Unstructured Host Self-Management

On paper, self-managing two or five serviced apartments looks straightforward until operational realities collide. A prospective corporate guest messages at midnight requesting airport pickup details and an invoice before authorizing payment. Two channels require immediate calendar blocking to avoid an overlapping weekend booking. A departing guest reports an electrical issue hours before the next arrival checks in at 2:00 PM. Without structured remote coordination, delayed replies cost confirmed reservations, hurried turnovers leave housekeeping details missed, and inconsistent follow-ups lead to preventable four-star review downgrades.

Even properties with on-site security guards or part-time housekeepers often lack centralized digital coordination. Frontline staff handle local physical tasks wonderfully when given clear schedules, yet rarely have the software tools, pricing playbooks, or written hospitality communication training needed to convert inquiries rapidly across WhatsApp, email, Airbnb, Booking.com, and direct web portals.

What Institutional Hospitality Virtual Support Covers

PureCrest’s Hospitality Virtual Support division functions as the digital nerve center for independent hotels, serviced residences, and multi-suite shortlet properties. Working seamlessly alongside your on-site housekeeping, security, and maintenance personnel, our remote specialists execute five core workflows every day:

First, continuous guest inquiry and reservation management ensures prospective travelers receive prompt, courteous, accurate answers within minutes rather than hours. Whether clarifying studio vs. two-bedroom suite layouts, confirming parking availability, verifying check-in windows, or issuing formal booking confirmations, rapid response speed directly improves conversion rates across both OTAs and direct web inquiries.

Second, pre-arrival screening and check-in orchestration protects asset security while making arrival effortless. Before check-in, virtual coordinators verify booking terms, clarify house policies—such as non-smoking and no-party guidelines—collect expected arrival times, and coordinate smooth handovers with local reception or smart access teams. Guests arrive feeling welcomed and prepared rather than waiting outside locked gates.

Third, centralized multi-channel calendar and rate coordination keeps availability synchronized across your direct website and external travel marketplaces. Whenever an extension, early check-out, or room upgrade is approved, virtual operations immediately adjust inventory blocks and daily tariffs so occupancy stays maximized without double-booking risk.

Fourth, remote housekeeping and preventive maintenance dispatch connects digital booking events to physical readiness on the ground. Automated turnover schedules alert cleaning supervisors the moment a suite clears check-out, complete with linen, kitchen appliance, and bathroom restocking checklists. Whenever guests flag maintenance requests during their stay, tickets are logged, assigned to vetted local technicians, and tracked through verified completion photos.

Fifth, structured owner reporting gives property owners—whether residing in Abuja, Enugu, Lagos, or abroad in the UK, Europe, or North America—clear visibility into occupancy trends, booking pipelines, maintenance logs, and guest satisfaction feedback without needing to chase daily phone updates.

Empowering Diaspora Property Owners and Multi-Site Operators

A large share of premium residential and hospitality real estate across Nigeria is owned by busy professionals and diaspora investors balancing demanding careers overseas. Historically, owning a hospitality property from abroad meant relying on informal family oversight or opaque local caretakers, often leading to untracked bookings, deferred upkeep, and disappointing net returns.

Pairing local on-site hospitality staff with PureCrest’s remote operations infrastructure eliminates geographic distance as an operational barrier. Standardized digital systems record every reservation request, guest interaction, and suite availability update transparently. Combined with smart booking software and regular visual property inspections, remote owners enjoy institutional accountability while preserving full ownership of their brand and real estate asset.

Standard Operating Playbooks and Multi-Channel Communication Hygiene

Exceptional remote hospitality requires clear written standard operating procedures tailored to each building’s architectural layout, utility configuration, and neighborhood profile. When PureCrest onboards a property onto Hospitality Virtual Support, we begin by documenting a dedicated digital operations bible covering room-by-room Wi-Fi credentials, generator and solar switchover protocols, vetted local culinary and transit recommendations, emergency plumbing and electrical escalation trees, and exact housekeeping turnover inspection criteria.

Armed with this single source of truth, our virtual coordinators answer complex guest requests accurately on the first reply rather than placing travelers on hold while calling local caretakers. Furthermore, every conversation thread across WhatsApp, email, Airbnb, Booking.com, and direct web inquiries follows standardized hospitality tone guidelines—warm, concise, solutions-oriented, and transparent about property house rules and billing policies. Owners receive structured summaries auditing response quality, open inquiries, and resolved tickets without interrupting live guest operations.

Preventing Revenue Leakage and Protecting Asset Longevity

Beyond guest communication, structured remote stewardship safeguards the financial and physical health of real estate investments. Informal property arrangements frequently suffer from unrecorded late check-outs, missed damage documentation between stays, unverified petty-cash maintenance spending, and prolonged booking gaps following uncoordinated repairs.

With virtual operations monitoring check-in and check-out timestamps daily, housekeepers submit timestamped suite readiness verification alongside linen and inventory counts immediately after each departure. Minor wear items—such as cabinet hinges, AC remotes, shower seals, or lighting fixtures—are flagged and scheduled with pre-approved artisans before the next guest checks in, preventing minor maintenance items from compounding into expensive capital replacements. Simultaneously, revenue oversight ensures extra-night extensions, corporate invoicing requests, and seasonal rate adjustments capture full market value across every calendar week.

Scaling Without Payroll Friction

For expanding hotel groups and multi-property shortlet managers, virtual hospitality support provides elastic operational capacity. Onboarding an additional wing of suites, launching a new serviced residence, or absorbing holiday booking surges no longer requires months of recruiting, office space expansion, or fragmented customer service training. Dedicated remote coordinators integrate immediately into your existing property workflows, maintaining unified brand tone and strict SLA response standards around the clock.

Whether operating an airport-corridor client residence like Richgates Hotels and Apartments in Enugu or managing a growing collection of serviced apartments in Abuja and across Nigeria, structured Hospitality Virtual Support turns daily operational complexity into calm, repeatable hospitality excellence.`;

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: 'operating-serviced-shortlets-hospitality-nigeria',
    title:
      'Operating Serviced Shortlets & Smart Hospitality Infrastructure Across Nigeria',
    slug: 'operating-serviced-shortlets-hospitality-nigeria',
    category: 'Hospitality',
    authorName: 'PureCrest Editorial Desk',
    publishedDate: '2026-11-16',
    excerpt:
      'An institutional breakdown of how multi-room inventory architecture, hybrid power microgrids, title verification, and smart access telemetry drive sustainable hospitality yields in Abuja, Enugu, and nationwide.',
    content: FLAGSHIP_ARTICLE_1,
    wordCount: countWords(FLAGSHIP_ARTICLE_1),
    coverImageUrl: '/src/assets/images/hero_lagos_penthouse_1794819192829.jpg',
    galleryImages: [
      '/src/assets/images/hero_lagos_penthouse_1794819192829.jpg',
      '/src/assets/images/shortlet_vi_suite_1794819194303.jpg',
      '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
    ],
    videoUrl: '',
    published: true,
    authorId: 'system',
  },
  {
    id: 'smart-building-telemetry-nigerian-real-estate',
    title:
      'Smart Building Telemetry, Hybrid Energy Metering & Digital Access Control in Modern Real Estate',
    slug: 'smart-building-telemetry-nigerian-real-estate',
    category: 'PropTech',
    authorName: 'PureCrest Editorial Desk',
    publishedDate: '2026-11-10',
    excerpt:
      'How IoT utility sub-metering, time-bound keyless access orchestration, and cloud owner systems eliminate revenue leakage and cut energy waste across commercial and hospitality developments.',
    content: FLAGSHIP_ARTICLE_2,
    wordCount: countWords(FLAGSHIP_ARTICLE_2),
    coverImageUrl: '/src/assets/images/tech_smart_building_1794819195524.jpg',
    galleryImages: [
      '/src/assets/images/tech_smart_building_1794819195524.jpg',
      '/src/assets/images/property_ikoyi_residence_1794819193481.jpg',
    ],
    videoUrl: '',
    published: true,
    authorId: 'system',
  },
  {
    id: 'ota-listing-optimization-direct-booking-conversions',
    title:
      'OTA Listing Optimization & Direct Booking Strategy for Hotels and Shortlet Operators',
    slug: 'ota-listing-optimization-direct-booking-conversions',
    category: 'Hospitality',
    authorName: 'PureCrest Editorial Desk',
    publishedDate: '2026-11-02',
    excerpt:
      'How structured Airbnb and Booking.com ranking optimization, suite-level visual sequencing, and dynamic rate parity maximize search visibility while converting repeat travelers to direct bookings.',
    content: FLAGSHIP_ARTICLE_3,
    wordCount: countWords(FLAGSHIP_ARTICLE_3),
    coverImageUrl: '/src/assets/images/shortlet_vi_suite_1794819194303.jpg',
    galleryImages: [
      '/src/assets/images/shortlet_vi_suite_1794819194303.jpg',
      '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
    ],
    videoUrl: '',
    published: true,
    authorId: 'system',
  },
  {
    id: 'remote-hospitality-virtual-support-property-stewardship',
    title:
      'Hospitality Virtual Support & Verified Property Stewardship Across Nigeria',
    slug: 'remote-hospitality-virtual-support-property-stewardship',
    category: 'Real Estate',
    authorName: 'PureCrest Editorial Desk',
    publishedDate: '2026-10-24',
    excerpt:
      'Why remote reservations desks, pre-arrival guest screening, housekeeping dispatch, and transparent cloud reporting empower hoteliers and diaspora property owners to scale reliably.',
    content: FLAGSHIP_ARTICLE_4,
    wordCount: countWords(FLAGSHIP_ARTICLE_4),
    coverImageUrl: '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
    galleryImages: [
      '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
      '/src/assets/images/property_ikoyi_residence_1794819193481.jpg',
    ],
    videoUrl: '',
    published: true,
    authorId: 'system',
  },
];

export const DEFAULT_SERVICES: ServiceOffering[] = [
  {
    id: 'svc-hospitality-ops',
    title: 'Purecrest Hospitality',
    division: 'hospitality',
    numberLabel: '01',
    tagline:
      'Hotel management, serviced apartments, and short-let operations delivering exceptional guest experiences and maximum owner returns.',
    description:
      'We partner with hotel owners and apartment proprietors across Nigeria to professionally manage, reposition, and operate their hospitality assets — overseeing full-service hotel teams, serviced apartment housekeeping, end-to-end short-let guest stays, dynamic pricing, and preventive engineering maintenance.',
    deliverables: [
      'Hotel Management — full operations, staff supervision, reservations & financial oversight',
      'Serviced Apartments — hotel-grade amenities, concierge services & seamless stays',
      'Short-Let Management — listing, marketing, housekeeping & guest communications',
      'Guest Experience Design — curated journeys driving consistent repeat stays',
      'Revenue Optimisation — dynamic pricing, occupancy & channel distribution',
      'Maintenance & Operations — proactive quality inspections & engineering support',
    ],
    metricHighlight: 'Full-Service Hospitality Operations',
    imageUrl: '/src/assets/images/hospitality_concierge_lobby_1794819194953.jpg',
    active: true,
    sortOrder: 1,
    authorId: 'system',
  },
  {
    id: 'svc-real-estate-sales',
    title: 'Purecrest Property',
    division: 'real-estate',
    numberLabel: '02',
    tagline:
      'Real estate development, property sales, and leasing creating lasting value across Nigeria.',
    description:
      'From our Abuja head office, PureCrest handles residential and commercial property development, verified home sales, corporate leasing, and land transactions — backed by transparent statutory title checks and disciplined facility stewardship.',
    deliverables: [
      'Residential & luxury apartment sales with verified statutory title documentation',
      'Corporate relocation & Grade-A commercial / residential leasing',
      'Registry title search, C-of-O & Governor’s Consent due diligence',
      'End-to-end estate facility management & long-term tenant care',
    ],
    metricHighlight: 'Sales, Development & Leasing',
    imageUrl: '/src/assets/images/property_ikoyi_residence_1794819193481.jpg',
    active: true,
    sortOrder: 2,
    authorId: 'system',
  },
  {
    id: 'svc-technology-systems',
    title: 'Pure Crest Technology',
    division: 'technology',
    numberLabel: '03',
    tagline:
      'Web development, booking systems, and hospitality software powering modern hospitality and property businesses.',
    description:
      'We design and build custom direct booking engines, branded hospitality websites, keyless smart access integrations, and real-time utility sub-metering systems that help hotels, shortlets, and property teams operate with speed and transparency.',
    deliverables: [
      'Custom Online Booking Portals with multi-room & suite inventory selection',
      'Real-Time Availability & Channel Synchronization across web & mobile',
      'Time-bound smart lock & digital visitor access orchestration',
      'IoT power, diesel & solar-hybrid sub-metering & owner reporting dashboards',
    ],
    metricHighlight: 'Booking Engines & Smart Systems',
    imageUrl: '/src/assets/images/tech_smart_building_1794819195524.jpg',
    active: true,
    sortOrder: 3,
    authorId: 'system',
  },
  {
    id: 'svc-hospitality-virtual-support',
    title: 'Hospitality Virtual Support',
    division: 'hospitality',
    numberLabel: '04',
    tagline:
      'Professional remote management for your hospitality business — 24/7 guest support, reservations, revenue management, and operations coordination.',
    description:
      'Ideal for independent short-let hosts, boutique hotels, and serviced residences needing reliable remote operations without expanding on-site payroll. Our virtual desk handles inquiries, check-in coordination, housekeeping scheduling, and calendar pricing continuously.',
    deliverables: [
      'Continuous guest messaging, pre-arrival screening & digital check-in support',
      'Multi-channel reservation handling & double-booking prevention',
      'Remote housekeeping, laundry & maintenance technician dispatch coordination',
      'Nightly rate calibration & structured monthly performance summaries',
    ],
    metricHighlight: 'Remote Operations Desk',
    imageUrl: '/src/assets/images/shortlet_vi_suite_1794819194303.jpg',
    active: true,
    sortOrder: 4,
    authorId: 'system',
  },
  {
    id: 'svc-ota-optimization',
    title: 'OTA Listing Optimization',
    division: 'hospitality',
    numberLabel: '05',
    tagline:
      'Airbnb, Booking.com, Vrbo, Expedia & Google Hotels listing optimization engineered to boost search visibility and conversion.',
    description:
      'We audit, rewrite, visually sequence, and calibrate your property listings across global Online Travel Agencies (OTAs) so qualified guests discover your rooms faster, book with confidence, and stay longer — paired seamlessly with your direct booking website.',
    deliverables: [
      'Search ranking optimization & keyword-structured headlines for Airbnb & Booking.com',
      'Editorial photography sequencing, room amenity tagging & floor-plan clarity',
      'Dynamic rate parity, seasonal minimum-stay rules & cancellation calibration',
      'Superhost & Preferred Partner compliance monitoring & automated guest playbooks',
    ],
    metricHighlight: 'Airbnb · Booking.com · Direct',
    imageUrl: '/src/assets/images/hero_lagos_penthouse_1794819192829.jpg',
    active: true,
    sortOrder: 5,
    authorId: 'system',
  },
];

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function generateReferenceCode(prefix = 'PC'): string {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  const numPart = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${randomPart}${numPart}`;
}

export function computeNightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(`${checkIn}T00:00:00Z`).getTime();
  const end = new Date(`${checkOut}T00:00:00Z`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 1;
  return Math.min(365, Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24))));
}
