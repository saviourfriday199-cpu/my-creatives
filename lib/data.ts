/**
 * Single source of truth for all site content.
 * Edit copy, pricing and contact details here — components stay untouched.
 */

export const site = {
  name: "O&F Pristine Solution",
  tagline: "Premium residential & commercial cleaning across Nigeria",
  description:
    "O&F Pristine Solution is Nigeria's premium residential and commercial cleaning company. Trained professionals, eco-friendly products and a satisfaction guarantee — for homes, offices and executive housekeeping.",
  url: "https://ofpristinesolution.ng",
  locale: "en_NG",
  phones: ["09139192450", "09039343495"],
  phoneIntl: "+2349139192450",
  whatsapp: "https://wa.me/2349139192450",
  instagram: {
    handle: "@pristinesolution.ng",
    url: "https://instagram.com/pristinesolution.ng",
  },
  tiktok: {
    handle: "@O&Fpristinesolution",
    url: "https://www.tiktok.com/@ofpristinesolution",
  },
  address: {
    locality: "Calabar",
    region: "Cross River",
    country: "NG",
  },
} as const;

export const nav = [
  { label: "Home", href: "/#home" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Contact", href: "/#contact" },
] as const;

export const trustItems = [
  "Residential Cleaning",
  "Commercial Cleaning",
  "Executive Housekeeping",
  "Eco-Friendly Products",
  "Satisfaction Guarantee",
] as const;

export type Service = {
  id: string;
  icon: "home" | "building" | "bell";
  name: string;
  priceRange: string;
  description: string;
  includes: string[];
  featured?: boolean;
  footnote?: string;
};

export const services: Service[] = [
  {
    id: "home-cleaning",
    icon: "home",
    name: "Home Cleaning",
    priceRange: "₦40,000 – ₦100,000",
    description:
      "Deep, meticulous cleaning for every kind of home — every surface, every corner, finished to a standard you can feel.",
    includes: [
      "Self Contain",
      "One Bedroom",
      "Two Bedroom",
      "Three Bedroom",
      "Four Bedroom",
      "Five Bedroom",
    ],
  },
  {
    id: "commercial-cleaning",
    icon: "building",
    name: "Commercial Cleaning",
    priceRange: "₦50,000 – ₦150,000",
    description:
      "Immaculate workspaces and event-ready venues, delivered around your schedule with zero disruption to business.",
    includes: ["Offices", "Move In", "Move Out", "Events", "Post Construction"],
  },
  {
    id: "executive-housekeeping",
    icon: "bell",
    name: "Executive Housekeeping",
    priceRange: "₦50,000 – ₦200,000",
    description:
      "Hotel-standard housekeeping on a schedule that suits you — your home, permanently guest-ready.",
    includes: ["Basic Plan — twice every month", "Premium Plan — once every week for one month"],
    featured: true,
    footnote: "Our signature service",
  },
];

export const features = [
  {
    icon: "academy",
    title: "Highly Trained Professionals",
    body: "Every cleaner is vetted, trained and held to a hospitality-grade standard.",
  },
  {
    icon: "spark",
    title: "Modern Equipment",
    body: "Professional-grade machines and tools that reach what ordinary cleaning can't.",
  },
  {
    icon: "leaf",
    title: "Eco-Friendly Products",
    body: "Safe for children, pets and sensitive skin — tough on everything else.",
  },
  {
    icon: "wallet",
    title: "Honest, Affordable Pricing",
    body: "Clear ranges, no surprises. You approve the quote before we begin.",
  },
  {
    icon: "calendar",
    title: "Reliable Scheduling",
    body: "We arrive when we say we will — and we work around your day, not ours.",
  },
  {
    icon: "detail",
    title: "Attention to Detail",
    body: "Skirting boards, switch plates, door handles. The details are the standard.",
  },
  {
    icon: "family",
    title: "Trusted by Families",
    body: "Homes and businesses across Nigeria invite us back, month after month.",
  },
  {
    icon: "shield",
    title: "Satisfaction Guaranteed",
    body: "If anything falls short, we return and make it right. That's the promise.",
  },
] as const;

export const processSteps = [
  {
    title: "Book",
    body: "Call, WhatsApp or send the form. Tell us about your space in two minutes.",
  },
  {
    title: "Inspection",
    body: "We assess the property and confirm a precise, transparent quote.",
  },
  {
    title: "Professional Cleaning",
    body: "A trained team transforms your space with modern equipment and safe products.",
  },
  {
    title: "Quality Check",
    body: "A supervisor walks through every room against our finishing checklist.",
  },
  {
    title: "Enjoy Your Space",
    body: "Come home to pristine. Breathe easier. Your time is yours again.",
  },
] as const;

export const testimonials = [
  {
    name: "Adaeze Okonkwo",
    location: "State Housing, Calabar",
    rating: 5,
    quote:
      "They cleaned my three-bedroom before my in-laws visited and I honestly didn't recognise the kitchen. Polite, punctual, and they brought everything themselves.",
  },
  {
    name: "Tunde Bakare",
    location: "Marian Road, Calabar",
    rating: 5,
    quote:
      "We use O&F for our office every month. The team works around our hours and the place smells like a hotel lobby when they're done.",
  },
  {
    name: "Chiamaka Eze",
    location: "Ekorinim, Calabar",
    rating: 5,
    quote:
      "Post-construction cleaning that actually removed the dust — from everywhere. Windows, vents, floors. Worth every naira.",
  },
  {
    name: "Ibrahim Suleiman",
    location: "Diamond Hill, Calabar",
    rating: 5,
    quote:
      "The executive housekeeping plan changed my weekends. I stopped cleaning and started resting. The weekly team is quiet, fast and thorough.",
  },
  {
    name: "Funke Adeyemi",
    location: "8 Miles, Calabar",
    rating: 5,
    quote:
      "Booked a move-out clean and got my full deposit back. My landlord asked who did the cleaning — I gave him their number.",
  },
  {
    name: "Emeka Obi",
    location: "Satellite Town, Calabar",
    rating: 5,
    quote:
      "Professional from the first call. They inspected, quoted, and delivered exactly what they promised. My shop has never looked better.",
  },
] as const;

export const faqs = [
  {
    q: "How do I book a cleaning?",
    a: "Call us on 09139192450 or 09039343495, message us on WhatsApp, or send the contact form below. We'll confirm your date, walk through your needs and schedule an inspection — usually within 24 hours.",
  },
  {
    q: "Do you bring your own supplies and equipment?",
    a: "Yes — everything. Our teams arrive with professional-grade equipment and eco-friendly products that are safe for children, pets and sensitive skin. You don't need to provide a thing.",
  },
  {
    q: "How long does a cleaning take?",
    a: "A self-contain or one-bedroom typically takes 2–4 hours. Larger homes, offices and post-construction projects can take a full day. We confirm the timing with your quote so you can plan around it.",
  },
  {
    q: "Do you clean offices and commercial spaces?",
    a: "Absolutely. We clean offices, retail spaces, event venues and new builds — including move-in, move-out and post-construction cleaning. We can work evenings or weekends so your business never pauses.",
  },
  {
    q: "Do you offer recurring cleaning?",
    a: "Yes. Our Executive Housekeeping plans keep your space permanently pristine — the Basic plan covers twice a month, and the Premium plan covers once every week for a month. Many clients simply renew.",
  },
  {
    q: "Do you clean after construction or renovation?",
    a: "Yes — it's one of our specialities. We remove construction dust, paint splatter and debris, then finish every surface so the space is ready to live or work in from day one.",
  },
] as const;
