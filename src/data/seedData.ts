import { countWords } from '../lib/mediaUtils';
import type { BlogPost, Listing, ServiceOffering, SiteContent } from '../types/purecrest';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'purecresthospitality@gmail.com';

export const LOGO_ASSET_PATH = '/assets/purecrest-logo.png';

export const ASSET_IMAGE_PRESETS = [
  {
    label: 'Ikoyi Waterfront Penthouse',
    url: '/src/assets/images/hero_lagos_penthouse_1794819192829.jpg',
  },
  {
    label: 'Ikoyi Detached Residence',
    url: '/src/assets/images/property_ikoyi_residence_1794819193481.jpg',
  },
  {
    label: 'Victoria Island Executive Suite',
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

export const DEFAULT_SITE_CONTENT: SiteContent = {
  id: 'main',
  sectionKey: 'main',
  brandName: 'PureCrest',
  heroEyebrow: 'PURECREST HOSPITALITY · ENUGU, ABUJA & LAGOS',
  heroTitle: 'Your Property. Our Management. Better Hospitality.',
  heroSubtitle:
    'We partner with hotel owners and property owners to professionally manage, reposition, and grow their hospitality assets — delivering memorable guest stays, curated shortlets, real estate sales and leasing, OTA optimization, and smart booking systems.',
  heroPrimaryCta: 'Browse Shortlets',
  heroSecondaryCta: 'Partner With Us',
  heroImageUrl: '/src/assets/images/hero_lagos_penthouse_1794819192829.jpg',
  aboutHeadline: 'Creating spaces and experiences that stand the test of time.',
  aboutBody:
    'Beginning with Richgates Hotels and Apartments in Enugu, PureCrest unifies hospitality management, residential and commercial sales and leasing, remote virtual support, OTA listing optimization, and intelligent property software across Nigeria.',
  statPropertiesManaged: 'PureCrest Portfolio',
  statOccupancyRate: 'Verified Operations',
  statCitiesActive: 'Abuja & Lagos',
  statEnterpriseClients: 'PureCrest Partners',
  contactEmail: 'hello@purecrest.ng',
  contactPhone: '+234 913 040 3970',
  officeAddress: 'Abuja, Federal Capital Territory, Nigeria',
  announcementBanner: '',
  officeHoursWeekday: '8:00 AM – 6:00 PM',
  officeHoursSaturday: '9:00 AM – 4:00 PM',
  officeHoursSunday: 'By Appointment',
  updatedBy: 'system',
};

export const DEFAULT_LISTINGS: Listing[] = [
  {
    id: 'richgates-hotels-and-apartments-enugu',
    title: 'Richgates Hotels and Apartments, Enugu',
    category: 'shortlet',
    propertyType: 'Apartment',
    location: 'Thinkers Corner, Enugu',
    address: 'Plot C/16-C, Fabian Okafor Close, Airport Road Extension, Thinkers Corner, Enugu',
    priceNgn: 91000,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 120,
    maxGuests: 6,
    summary:
      'Serviced hotel suites and multi-room apartments 1 km from Akanu Ibiam Intl Airport — equipped kitchens, free Wi-Fi, private parking, fitness center, bar, and 24/7 front desk.',
    description:
      'Located at Plot C/16-C, Fabian Okafor Close, Airport Road Extension, Thinkers Corner, Enugu (approximately 1 km from Akanu Ibiam International Airport), Richgates Hotels and Apartments offers studio suites and multi-bedroom serviced apartments designed for business, transit, and family stays. Accommodations feature air conditioning, flat-screen Smart TVs, work desks, wardrobes, seating and dining areas, and private bathrooms with shower, bathtub, bidet, hairdryer, and free toiletries, plus equipped kitchens or kitchenettes with refrigerator, freezer, microwave, gas cooker, electric kettle, smoke extractor, and washing machine. Guests enjoy free Wi-Fi throughout, free on-site private parking, garden-view balconies, fitness center, on-site bar and lounge, continental breakfast options, and 24-hour front desk and room service. Standard check-in opens from 2:00 PM with check-out by 12:00 PM; pets and parties are not permitted.',
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

const FLAGSHIP_ARTICLE_1 = `Across Ikoyi, Victoria Island, and Abuja’s Maitama corridor, the economics of residential and commercial real estate have shifted decisively away from passive landlordism toward active hospitality operations. Property owners who once relied exclusively on annual residential leases are discovering that professionally managed serviced residences and multi-room executive shortlets deliver substantially higher net operating income when paired with disciplined engineering, transparent accounting, and hotel-grade guest stewardship. Yet capturing that yield consistently requires far more than furnishing an apartment and listing it online. It demands an institutional operating framework capable of bridging physical asset care with modern property technology.

The Structural Shift Toward Serviced Hospitality in West Africa

Corporate travelers, diplomatic delegations, diaspora families, and project consultants arriving in Lagos or Abuja expect predictability above everything else. Traditional boutique hotels often struggle with cramped floor plans for multi-week assignments, rigid dining schedules, and inconsistent broadband capacity. Conversely, unstandardized peer-to-peer shortlets frequently suffer from erratic power transitions, delayed maintenance response, opaque check-in procedures, and inconsistent housekeeping standards. PureCrest was structured specifically to close that operational gap by combining the spatial comfort of private architectural residences with the service reliability of an institutional hospitality operator.

In prime districts such as Old Ikoyi and Victoria Island, demand has bifurcated sharply between unbranded units competing purely on nightly discounts and professionally operated properties capable of commanding sustained occupancy above ninety percent. Corporate travel desks and multinational procurement teams increasingly require verified safety compliance, audited invoicing, guaranteed dual-ISP internet redundancy, and uninterrupted power availability before approving accommodations for visiting executives. Properties that meet these benchmarks retain repeat corporate accounts across quarters rather than relying solely on seasonal leisure spikes.

Multi-Room Inventory Architecture and Yield Optimization

One of the highest-leverage mechanisms in modern urban hospitality is flexible multi-room inventory design. Rather than locking a large four-bedroom penthouse or multi-wing villa into a single rigid nightly price, well-designed floor plans allow operators to commercialize individual private suites alongside full-residence buyouts depending on seasonal demand and booking lead times. During midweek corporate travel windows, solo visiting executives and two-person advisory teams often prefer booking an individual master wing or corner suite with private keyless entry and dedicated study workspace. Over weekends, diplomatic summits, or family holidays, the same asset converts seamlessly into a unified four-bedroom sanctuary.

At PureCrest, dynamic rate modeling balances single-suite occupancy against full-unit availability so revenue per available room climbs without sacrificing guest privacy. Every room tier maintains dedicated digital lock credentials, separate housekeeping checklists, tailored amenity kits, and independent climate controls. When a guest books an individual room inside a multi-suite property, automated access provisioning restricts entry strictly to their assigned suite and shared lounge amenities while preserving acoustic and physical separation across wings.

Power Economics, Hybrid Microgrids, and Preventive Engineering

In Nigerian hospitality management, utility reliability is the single greatest determinant of both guest satisfaction scores and net owner returns. Running diesel generators continuously without load optimization erodes operating margins rapidly and introduces mechanical fatigue across alternators and cooling compressors. Institutional asset stewardship treats power generation as an engineered system rather than an afterthought.

Our engineering audits begin by mapping baseline thermal loads across air conditioning units, water heaters, booster pumps, and kitchen appliances. By pairing lithium-iron-phosphate battery banks and solar arrays with automated generator synchronization and smart circuit shedding, well-calibrated residences cut diesel consumption dramatically while eliminating the brief voltage transfer flickers that disrupt video conferences and damage sensitive appliances. Preventive maintenance schedules—covering quarterly chiller descaling, weekly transfer-switch diagnostics, reverse-osmosis water filtration checks, and moisture inspections—prevent minor wear from escalating into emergency room closures during peak occupancy weeks.

Title Due Diligence and Institutional Asset Protection

For diaspora owners and family offices acquiring Lagos or Abuja properties specifically for hospitality operations or long-term capital preservation, acquisition discipline precedes operational performance. A residence with superior architectural finishes cannot function as a bankable asset if its statutory documentation carries unresolved encumbrances. Every acquisition mandate managed through PureCrest’s property desk undergoes layered verification: tracing root of title at the state land registry, confirming Governor’s Consent or Certificate of Occupancy validity, auditing building plan approvals against actual structural footprints, and verifying service-charge governance inside multi-unit estates.

Equally critical is structuring clear management agreements that align operator incentives with long-term asset preservation. Owners deserve line-of-sight visibility into gross booking receipts, OTA and direct-channel commission splits, utility sub-metering expenses, preventive maintenance reserves, and capital expenditure approvals. Opaque flat-fee deductions without itemized telemetry invite distrust; audited monthly owner statements backed by live portal metrics build multi-year institutional partnerships.

The Role of Property Technology in Eliminating Revenue Leakage

Technology inside real estate only creates durable value when it solves concrete operational bottlenecks on the ground. In hospitality and multi-tenant commercial buildings, revenue leakage typically hides in four places: unrecorded cash extensions at reception, untraceable diesel and grid power consumption, delayed maintenance ticketing, and fragmented booking calendars across direct web channels and international travel agencies.

Deploying a unified property operating layer addresses all four vulnerabilities simultaneously. Time-bound smart lock codes issued automatically upon verified reservation confirmation eliminate unauthorized room occupancy, because doors simply will not unlock outside paid booking windows. IoT utility sub-meters measure kilowatt-hour consumption per suite and per commercial floor plate in real time, flagging anomalous overnight HVAC draws or generator inefficiencies within minutes. Meanwhile, direct booking platforms with instant date-range calculators, multi-room selection, and verified customer portals capture corporate repeat bookings without sacrificing eighteen-percent intermediary commissions on every returning stay.

Designing for Longevity: Architecture, Acoustics, and Interior Materiality

Beyond software and engineering, guests remember how a space feels during the quiet moments between meetings. High-turnover shortlets decorated with fragile mass-market furniture age poorly within twelve months, driving up replacement capex and depressing review ratings. PureCrest advises developers and property owners to specify commercial-grade hospitality materials from day one: honed travertine and sealed porcelain surfaces that resist tropical humidity, solid walnut or engineered oak joinery, blackout acoustic drapery, high-thread-count hotel percale linens, and layered warm architectural lighting that transitions effortlessly from daytime workspace clarity to evening relaxation.

Acoustic insulation deserves equal attention. Installing double-glazed acoustic curtain walls along arterial roads in Victoria Island or Lekki Phase 1 transforms an apartment situated near vibrant commercial hubs into a serene retreat where international executives can rest across time zones without street noise intrusion.

Looking Ahead: Building Transparent Real Estate Institutions

Nigeria’s urban hospitality and real estate market is maturing rapidly. Capital continues to gravitate toward operators who demonstrate verifiable governance, engineering rigor, architectural taste, and software transparency. Whether repositioning a single heritage residence in Ikoyi, structuring a multi-unit executive shortlet tower in Victoria Island, or deploying smart access and energy telemetry across a Grade-A commercial complex, integrated execution wins over fragmented contracting every time. At PureCrest, our commitment remains focused on measurable yield for asset owners, effortless stays for guests, and enduring technical standards across every property carrying our name.`;

const FLAGSHIP_ARTICLE_2 = `Commercial office towers, gated residential estates, and boutique serviced apartment buildings across Lagos and Abuja share a common operational challenge: utility and security management often consumes up to forty percent of gross operating budgets while still relying on manual logbooks, paper visitor slips, and reactive repairs. As energy tariffs fluctuate and institutional tenants demand ESG-grade transparency, legacy building management practices have become financially unsustainable. Transitioning to connected building telemetry and unified digital portals is no longer an experimental luxury for Nigerian developments—it is the foundation of competitive asset valuation.

Why Legacy Estate and Facility Management Breaks Down at Scale

In a conventional twelve-unit luxury apartment block or multi-tenant commercial building, facility managers spend most of their week reconciling fragmented spreadsheets. Security guards record visitor names in handwritten ledgers that cannot be searched during compliance audits. Generator operators log diesel deliveries and runtime hours manually on clipboards, leaving facility committees guessing whether high monthly power bills stem from genuine tenant consumption, cooling inefficiencies, or fuel pilferage. Maintenance technicians receive repair requests across scattered messaging threads with no SLA tracking, causing recurring plumbing or electrical faults to go unnoticed until major equipment fails.

These manual blind spots hurt every stakeholder. Tenants and shortlet guests resent unpredictable service-charge assessments without clear usage breakdowns. Property owners suffer depressed net yields and accelerated depreciation of mechanical plants. Facility managers burn administrative hours defending numbers rather than proactively improving resident experience.

Smart Metering and Real-Time Energy Intelligence

The cornerstone of PureCrest’s technology division is real-time utility telemetry engineered specifically for Nigeria’s hybrid power reality, where buildings routinely switch between public grid supply, solar-battery inverters, and diesel or gas generators. By installing industrial IoT sub-meters across distribution boards and individual apartments or office suites, building operators gain second-by-second visibility into voltage stability, phase balance, and exact kilowatt-hour usage segmented by power source.

Instead of dividing diesel bills arbitrarily by square meterage—a practice that penalizes energy-conscious tenants—automated billing engines calculate precise tariff-weighted consumption for every unit. When an office tenant leaves central chillers running over a public holiday or a vacant shortlet suite exhibits abnormal nighttime draw, automated threshold alerts notify building engineers immediately. Across commercial complexes we monitor, simply surfacing granular load patterns and eliminating idle mechanical runtimes typically reduces total energy waste by eighteen to twenty-six percent within the first ninety days of deployment.

Keyless Access Control and Digital Visitor Orchestration

Physical security in prime Lagos and Abuja districts must balance strict perimeter verification with frictionless arrival for approved residents, corporate guests, and VIP visitors. Long queues at security gates and lost mechanical keys create unnecessary friction while weakening auditability.

Modern PropTech access infrastructure replaces static keys and paper passes with time-bound digital credentials. When a guest confirms a shortlet reservation or a corporate tenant schedules a boardroom visitor through the PureCrest portal, the system generates an encrypted PIN or QR pass valid strictly within the authorized time window and restricted solely to designated floors, elevators, and suites. Every entry event logs cleanly to an immutable digital access trail, giving estate security teams instant verification while respecting resident privacy. Should a guest extend their stay by three nights or cancel early, access permissions update automatically without anyone needing to visit the property physically to rekey locks.

Preventive Maintenance Workflows and Asset Lifecycle Telemetry

Mechanical downtime rarely happens without warning signs. Rising generator coolant temperatures, frequent inverter overload trips, subtle drops in water booster pressure, and anomalous HVAC compressor amperage all precede catastrophic hardware failure by days or weeks. Connecting plant sensors and technician mobile checklists into a single maintenance ledger turns firefighting into scheduled engineering.

Every PureCrest-managed building maintains a digital asset registry tracking serial numbers, warranty dates, filter replacement intervals, and technician sign-off photos for every chiller, lift, water treatment plant, and solar inverter. Preventive work orders generate automatically based on runtime hours rather than calendar guesswork. For asset owners viewing their dashboard remotely from London, Houston, or Abuja, this translates into confidence that capital equipment is being protected with verifiable discipline rather than deferred until costly replacements are unavoidable.

Direct Booking Engines and Unified Owner Portals

For hospitality operators and residential developers monetizing shortlet inventory, dependency on third-party listing marketplaces introduces heavy commission drag and zero control over guest relationships. While global OTAs provide valuable top-of-funnel discovery, healthy hospitality businesses systematically convert repeat corporate travelers and referral traffic onto owned digital infrastructure.

A modern hospitality web platform must pair editorial visual storytelling with instant utility: clear multi-room unit breakdowns, transparent Naira pricing calculators, verified calendar requests, and a dedicated client portal where returning guests retrieve invoices, download arrival instructions, and manage upcoming stays. Simultaneously, the underlying CMS must empower internal operations teams to publish new residences, update nightly rates, upload high-resolution photography and video walkthroughs, and respond to corporate inquiries in seconds without waiting on external developers.

Security, Data Privacy, and Cloud Resilience

Running real estate and hospitality operations in the cloud demands strict adherence to data isolation and uptime resilience. Guest passports, corporate phone numbers, booking histories, and proprietary financial metrics represent sensitive personally identifiable information. Role-based access rules must enforce strict boundaries at the database layer—ensuring customers only access their own reservations and saved properties while administrators operate under verified multi-factor authentication and immutable audit timestamps.

Deploying the presentation layer onto globally distributed edge networks such as Cloudflare Pages guarantees sub-second page delivery across Lagos, Abuja, London, and North America, ensuring diaspora investors and international travelers experience crisp responsiveness regardless of regional bandwidth conditions. By unifying architectural excellence, disciplined hospitality stewardship, and resilient cloud software, PureCrest establishes a modern operating standard for Nigerian real estate.

Phased Deployment Roadmap for Existing Estates and New Developments

Property owners do not need to demolish legacy infrastructure to modernize building operations. PureCrest’s engineering rollout typically proceeds in three structured phases over four to six weeks. Phase one covers electrical panel auditing, sub-meter commissioning, and fiber-redundant gateway installation without interrupting resident power. Phase two replaces mechanical entry locks on priority suites and estate gates with offline-capable smart access hardware synced to the central booking ledger. Phase three activates the branded web portal, automated service-charge invoicing, and live owner telemetry dashboards, giving asset owners immediate financial clarity and measurable utility savings from month one onward.`;

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: 'investing-lagos-serviced-shortlets-2026',
    title:
      'Operating Lagos & Abuja Serviced Shortlets & Smart Hospitality Infrastructure: Operational Discipline',
    slug: 'investing-lagos-serviced-shortlets-2026',
    category: 'Hospitality',
    authorName: 'PureCrest Research & Operations Desk',
    excerpt:
      'An institutional breakdown of how multi-room inventory architecture, hybrid power microgrids, title verification, and smart access telemetry drive sustainable hospitality yields across Ikoyi, Victoria Island, and Abuja.',
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
      'Smart Building Telemetry, Hybrid Energy Metering & Digital Access Control in Prime Nigerian Real Estate',
    slug: 'smart-building-telemetry-nigerian-real-estate',
    category: 'PropTech',
    authorName: 'PureCrest Property Systems Engineering',
    excerpt:
      'How IoT utility sub-metering, time-bound keyless access orchestration, and cloud owner portals eliminate revenue leakage and cut energy waste across Grade-A commercial and residential developments.',
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
      'We partner with hotel owners and apartment proprietors to professionally manage, reposition, and operate their hospitality assets — overseeing full-service hotel teams, serviced apartment housekeeping, end-to-end short-let guest stays, dynamic pricing, and preventive engineering maintenance.',
    deliverables: [
      'Hotel Management — full operations, staff supervision, reservations & financial oversight',
      'Serviced Apartments — hotel-grade amenities, concierge services & seamless stays',
      'Short-Let Management — listing, marketing, housekeeping & guest communications',
      'Guest Experience Design — curated journeys driving consistent repeat stays',
      'Revenue Optimisation — dynamic pricing, occupancy & channel distribution',
      'Maintenance & Operations — proactive quality inspections & engineering support',
    ],
    metricHighlight: 'Abuja & Lagos Operations',
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
      'PureCrest handles residential and commercial property development, verified home sales, corporate leasing, and land transactions in Abuja and Lagos — backed by transparent statutory title checks and disciplined facility stewardship.',
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
      'We design and build custom direct booking engines, branded hospitality websites, keyless smart access integrations, and real-time utility sub-metering portals that help hotels, shortlets, and property teams operate with speed and transparency.',
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
      'Professional remote management for your hospitality business — guest support, reservations, revenue management, and operations coordination.',
    description:
      'Ideal for independent short-let hosts, boutique hotels, and serviced residences needing reliable remote operations without expanding on-site overhead. Our virtual desk handles inquiries, check-in coordination, housekeeping scheduling, and calendar pricing continuously.',
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
      'We audit, rewrite, visually sequence, and calibrate your property listings across global Online Travel Agencies (OTAs) so qualified guests discover your rooms faster, book with confidence, and stay longer — paired seamlessly with your direct booking site.',
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
