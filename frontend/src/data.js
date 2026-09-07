export const WHATSAPP_NUMBER = '237670912851';
export const CONTACT_EMAIL = 'fuesohyushaou@gmail.com';
export const CONTACT_PHONE_DISPLAY = '+237 670 912 851';
export const WHATSAPP_MESSAGE =
  'Hello%20IT-ISEP%20LTD.%2C%20I%20would%20like%20information%20about%20your%20services.';
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;
export const WHATSAPP_HELP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${'Hello%20IT-ISEP%20LTD.%2C%20I%20need%20help%20choosing%20networking%20equipment.'}`;

export const CHAT_SUPPORT_NAME = 'IT-ISEP Support';

export const equipmentCategories = ['All', 'Routers', 'Access Points', 'Switches', 'CPE', 'Fibre'];

export const serviceTags = ['All', 'FIBRE', 'SATELLITE', 'WI-FI', 'NETWORK', 'EQUIPMENT', 'SUPPORT'];

export const selectorCards = [
  { title: 'Home Internet', desc: 'Fast and reliable connectivity for households.', cta: 'Explore Home Internet', icon: '<path d="M3 11l9-7 9 7" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10v9h14v-9" stroke="white" stroke-width="1.8" stroke-linejoin="round"/>' },
  { title: 'Business Internet', desc: 'Reliable connectivity for offices, companies and organizations.', cta: 'Explore Business Solutions', icon: '<rect x="4" y="4" width="16" height="16" rx="1.5" stroke="white" stroke-width="1.7"/><path d="M8 9h2M8 13h2M14 9h2M14 13h2" stroke="white" stroke-width="1.7" stroke-linecap="round"/>' },
  { title: 'Fibre Optic', desc: 'High-speed fibre installation and infrastructure solutions.', cta: 'Explore Fibre', icon: '<circle cx="12" cy="12" r="9" stroke="white" stroke-width="1.7"/><circle cx="12" cy="12" r="3.5" stroke="white" stroke-width="1.7"/>' },
  { title: 'Satellite', desc: 'Connectivity for locations where terrestrial infrastructure is unavailable.', cta: 'Explore Satellite', icon: '<path d="M9 15l-5 5M4 15l5 5" stroke="white" stroke-width="1.8" stroke-linecap="round"/><path d="M7 11l4-4 6 6-4 4a6 6 0 0 1-6-6z" stroke="white" stroke-width="1.8" stroke-linejoin="round"/>' },
];

export const needs = [
  { label: 'Internet\nService', icon: '<path d="M2 8.5C7 3.5 17 3.5 22 8.5" stroke="#0B63CE" stroke-width="2" stroke-linecap="round"/><path d="M5.5 12C9 8.5 15 8.5 18.5 12" stroke="#0B63CE" stroke-width="2" stroke-linecap="round"/><path d="M9 15.5C10.5 14 13.5 14 15 15.5" stroke="#0B63CE" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="19" r="1.6" fill="#0B63CE"/>' },
  { label: 'Fibre Optic\nService', icon: '<circle cx="12" cy="12" r="9" stroke="#0B63CE" stroke-width="1.8"/><circle cx="12" cy="12" r="4" stroke="#0B63CE" stroke-width="1.8"/><circle cx="12" cy="12" r="1" fill="#0B63CE"/>' },
  { label: 'Satellite\nInternet', icon: '<path d="M9 15l-5 5M4 15l5 5M3 3l4 4M17 3l4 4" stroke="#0B63CE" stroke-width="1.8" stroke-linecap="round"/><path d="M8 12l4-4 6 6-4 4a6 6 0 0 1-6-6z" stroke="#0B63CE" stroke-width="1.8" stroke-linejoin="round"/>' },
  { label: 'Wi-Fi Zone\nInstallation', icon: '<path d="M2 8.5C7 3.5 17 3.5 22 8.5" stroke="#0B63CE" stroke-width="2" stroke-linecap="round"/><path d="M5.5 12C9 8.5 15 8.5 18.5 12" stroke="#0B63CE" stroke-width="2" stroke-linecap="round"/><rect x="17" y="14" width="6" height="8" rx="1" stroke="#0B63CE" stroke-width="1.6"/>' },
  { label: 'Network\nInstallation', icon: '<circle cx="12" cy="5" r="2" stroke="#0B63CE" stroke-width="1.6"/><circle cx="5" cy="19" r="2" stroke="#0B63CE" stroke-width="1.6"/><circle cx="19" cy="19" r="2" stroke="#0B63CE" stroke-width="1.6"/><path d="M12 7v6M12 13L6 17M12 13l6 4" stroke="#0B63CE" stroke-width="1.6"/>' },
  { label: 'ISP\nEquipment', icon: '<rect x="4" y="6" width="16" height="12" rx="1.5" stroke="#0B63CE" stroke-width="1.6"/><path d="M8 10h8M8 14h5" stroke="#0B63CE" stroke-width="1.6" stroke-linecap="round"/>' },
  { label: 'CPE\nEquipment', icon: '<rect x="5" y="9" width="14" height="7" rx="1.5" stroke="#0B63CE" stroke-width="1.6"/><path d="M8 5v4M12 5v4M16 5v4" stroke="#0B63CE" stroke-width="1.6" stroke-linecap="round"/>' },
  { label: 'Technical\nSupport', icon: '<path d="M4 13v-1a8 8 0 0 1 16 0v1" stroke="#0B63CE" stroke-width="1.7"/><rect x="2.5" y="13" width="4" height="6" rx="1.5" stroke="#0B63CE" stroke-width="1.6"/><rect x="17.5" y="13" width="4" height="6" rx="1.5" stroke="#0B63CE" stroke-width="1.6"/>' },
];

export const plans = [
  { name: 'Basic', speed: '10 Mbps', price: '25,000', popular: false },
  { name: 'Standard', speed: '20 Mbps', price: '35,000', popular: true },
  { name: 'Premium', speed: '50 Mbps', price: '55,000', popular: false },
  { name: 'Business', speed: '100 Mbps', price: '100,000', popular: false },
];

export const services = [
  { name: 'Fibre Optic Solutions', desc: 'Installation, splicing, termination, OTDR testing & maintenance', tag: 'FIBRE', features: ['Installation', 'Splicing', 'OTDR Testing'] },
  { name: 'Satellite Internet', desc: 'Site survey, antenna installation, configuration & support', tag: 'SATELLITE', features: ['Site Survey', 'Configuration', 'Support'] },
  { name: 'Wi-Fi Solutions', desc: 'Wi-Fi zone design, hotspot deployment & installation', tag: 'WI-FI', features: ['Design', 'Deployment', 'Installation'] },
  { name: 'Network Installation', desc: 'LAN/WAN, structured cabling, configuration & more', tag: 'NETWORK', features: ['Structured Cabling', 'Configuration'] },
  { name: 'IT Equipment Sales', desc: 'Top quality ISP & networking equipment', tag: 'EQUIPMENT', features: ['Quality Guarantee', 'After-Sales Support'] },
  { name: 'Technical Support', desc: '24/7 support, troubleshooting & maintenance', tag: 'SUPPORT', features: ['24/7 On-Call', 'Troubleshooting', 'Maintenance'] },
];

export const serviceIcons = [
  '<path d="M4 20c4-8 12-8 16-16" stroke="white" stroke-width="1.8" stroke-linecap="round"/><circle cx="6" cy="18" r="2" stroke="white" stroke-width="1.6"/>',
  '<path d="M9 15l-5 5M4 15l5 5" stroke="white" stroke-width="1.8" stroke-linecap="round"/><path d="M7 11l4-4 6 6-4 4a6 6 0 0 1-6-6z" stroke="white" stroke-width="1.8" stroke-linejoin="round"/>',
  '<path d="M2 8.5C7 3.5 17 3.5 22 8.5" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M5.5 12C9 8.5 15 8.5 18.5 12" stroke="white" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="18" r="1.6" fill="white"/>',
  '<circle cx="12" cy="5" r="2" stroke="white" stroke-width="1.6"/><circle cx="5" cy="19" r="2" stroke="white" stroke-width="1.6"/><circle cx="19" cy="19" r="2" stroke="white" stroke-width="1.6"/><path d="M12 7v6M12 13L6 17M12 13l6 4" stroke="white" stroke-width="1.6"/>',
  '<rect x="4" y="6" width="16" height="12" rx="1.5" stroke="white" stroke-width="1.6"/><path d="M8 10h8M8 14h5" stroke="white" stroke-width="1.6" stroke-linecap="round"/>',
  '<path d="M4 13v-1a8 8 0 0 1 16 0v1" stroke="white" stroke-width="1.7"/><rect x="2.5" y="13" width="4" height="6" rx="1.5" stroke="white" stroke-width="1.6"/><rect x="17.5" y="13" width="4" height="6" rx="1.5" stroke="white" stroke-width="1.6"/>',
];

export const howItWorks = [
  { step: '1', title: 'Tell Us What You Need', desc: 'Pick a service or request availability with your location.' },
  { step: '2', title: 'We Assess Your Location', desc: 'Our technical team verifies coverage and feasibility.' },
  { step: '3', title: 'We Provide a Quotation', desc: 'You receive a tailored solution and pricing.' },
  { step: '4', title: 'We Install & Configure', desc: 'Our technicians handle setup end-to-end.' },
];

export const businessServices = [
  'Dedicated Internet', 'Business Fibre', 'Structured Cabling', 'Wi-Fi Deployment',
  'Point-to-Point Wireless', 'Network Security & VPN', 'Firewall Deployment', 'Maintenance Contracts',
];

export const shopItems = [
  { name: 'MikroTik hEX S 5-Port Gigabit Router', price: '45,000', sku: 'RTR-001', category: 'Routers', features: ['In Stock', 'VPN-capable'] },
  { name: 'Ubiquiti UniFi AC Lite Access Point', price: '75,000', sku: 'AP-014', category: 'Access Points', features: ['In Stock', 'PoE Powered'] },
  { name: 'TP-Link Archer C6 AC1200 Wi-Fi Router', price: '35,000', sku: 'RTR-022', category: 'Routers', features: ['In Stock', 'Home Friendly'] },
  { name: 'Wavelink Outdoor CPE', price: '40,000', sku: 'CPE-007', category: 'CPE', features: ['In Stock', 'Pre-configured'] },
  { name: 'MikroTik CRS328 24 Port Switch', price: '250,000', sku: 'SW-009', category: 'Switches', features: ['In Stock', 'PoE+ 24-Port'] },
  { name: 'TP-Link EC330 FTTH GPON ONT', price: '28,000', sku: 'FBR-010', category: 'Fibre', features: ['In Stock', 'GPON Ready'] },
  { name: 'Ubiquiti NanoBeam 5AC 16dBi PTP CPE', price: '95,000', sku: 'CPE-012', category: 'CPE', features: ['In Stock', 'Point-to-Point'] },
  { name: 'Ubiquiti UniFi 8-Port PoE+ Switch', price: '185,000', sku: 'SW-018', category: 'Switches', features: ['In Stock', 'Compact PoE+'] },
];

export const features = [
  { title: 'Professional Expertise', desc: 'Certified & skilled network specialists', icon: '<circle cx="8" cy="8" r="3" stroke="#5BC2FF" stroke-width="1.6"/><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke="#5BC2FF" stroke-width="1.6"/><circle cx="17" cy="9" r="2.5" stroke="#5BC2FF" stroke-width="1.6"/><path d="M14 20c.3-2.6 1.8-4.5 5-4.5" stroke="#5BC2FF" stroke-width="1.6"/>' },
  { title: 'Reliable Connectivity', desc: 'Fast, stable & secure service', icon: '<path d="M2 8.5C7 3.5 17 3.5 22 8.5" stroke="#5BC2FF" stroke-width="2" stroke-linecap="round"/><path d="M5.5 12C9 8.5 15 8.5 18.5 12" stroke="#5BC2FF" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="18" r="1.6" fill="#5BC2FF"/>' },
  { title: 'Local Technical Support', desc: 'On-the-ground teams across Cameroon', icon: '<path d="M4 13v-1a8 8 0 0 1 16 0v1" stroke="#5BC2FF" stroke-width="1.7"/><rect x="2.5" y="13" width="4" height="6" rx="1.5" stroke="#5BC2FF" stroke-width="1.6"/><rect x="17.5" y="13" width="4" height="6" rx="1.5" stroke="#5BC2FF" stroke-width="1.6"/>' },
  { title: 'End-to-End Installation', desc: 'Survey, install, configure, support', icon: '<path d="M12 21s7-6.1 7-11.4A7 7 0 1 0 5 9.6C5 14.9 12 21 12 21z" stroke="#5BC2FF" stroke-width="1.6"/><circle cx="12" cy="9.5" r="2.3" stroke="#5BC2FF" stroke-width="1.6"/>' },
];

export const faqs = [
  { q: 'How do I get Internet from IT-ISEP?', a: 'Use the Check Availability form with your location and service needed — our team verifies coverage and contacts you to arrange installation.' },
  { q: 'Is fibre available in my area?', a: 'Availability depends on your location. Submit an availability request and our technical team will confirm coverage for your address.' },
  { q: 'Do you provide satellite Internet?', a: 'Yes. Satellite is available for areas without terrestrial fibre or wireless coverage, including remote and temporary sites.' },
  { q: 'How long does installation take?', a: 'Timelines vary by service and site survey results. Your technician will confirm an estimated schedule after the site assessment.' },
  { q: 'Can you install Internet in a remote area?', a: 'Yes, satellite and point-to-point wireless solutions are designed for remote and hard-to-reach locations.' },
  { q: 'Do you sell routers and fibre equipment?', a: 'Yes. Browse the Equipment Marketplace and add items to your quote cart, or request pricing directly.' },
  { q: 'Can you design a network for my company?', a: 'Yes — our Business Solutions team designs, installs and maintains network infrastructure for organizations of all sizes.' },
  { q: 'How do I contact technical support?', a: 'Use the Support section, WhatsApp, phone or email — all listed in Contact Us.' },
];

export const cities = ['Yaoundé', 'Douala', 'Buea', 'Limbe', 'Bamenda', 'Bafoussam', 'Kribi', 'Other'];