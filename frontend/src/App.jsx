import { useCallback, useEffect, useState } from 'react';
import { shopItems, services as servicesFallback } from './data.js';
import useCmsData from './useCmsData.js';
import { api } from './api.js';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Store from './components/Store.jsx';
import ServiceSelector from './components/ServiceSelector.jsx';
import NeedsGrid from './components/NeedsGrid.jsx';
import Availability from './components/Availability.jsx';
import Plans from './components/Plans.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Business from './components/Business.jsx';
import Features from './components/Features.jsx';
import About from './components/About.jsx';
import FAQ from './components/FAQ.jsx';
import CTA from './components/CTA.jsx';
import Footer from './components/Footer.jsx';
import WhatsAppFloat from './components/WhatsAppFloat.jsx';
import QuoteCart from './components/QuoteCart.jsx';
import QuoteModal from './components/QuoteModal.jsx';
import ChatInquiry from './components/ChatInquiry.jsx';

const CATEGORY_FALLBACK = {
  RTR: 'Routers', AP: 'Access Points', SW: 'Switches', CPE: 'CPE', FBR: 'Fibre'
};

function categoryFor(item) {
  if (item.category) return item.category;
  const prefix = String(item.sku || '').split('-')[0].toUpperCase();
  return CATEGORY_FALLBACK[prefix] || null;
}

const normalizeEquipment = rows =>
  rows.map(r => ({
    id: r.id,
    sku: r.sku || `EQ-${r.id}`,
    name: r.name,
    price: r.price,
    image: r.image || null,
    category: categoryFor(r),
    features: r.features || ['In Stock']
  }));

const normalizeServices = rows =>
  rows.map(r => ({
    id: r.id,
    name: r.name,
    desc: r.description,
    tag: r.tag,
    image: r.image,
    features: r.features || []
  }));

function parseNum(v) {
  return Number(String(v ?? '').replace(/[^\d]/g, '')) || 0;
}

export default function App() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('itisep_cart') || '[]'));
  const [cartOpen, setCartOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState(null);
  const [equipment] = useCmsData('equipment', shopItems, normalizeEquipment);
  const [services] = useCmsData('services', servicesFallback, normalizeServices);
  const [heroBackground, setHeroBackground] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.getSettings().then(s => {
      if (!cancelled) setHeroBackground(s.heroBackground || null);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    localStorage.setItem('itisep_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback(sku => {
    setCart(prev => {
      const found = prev.find(c => c.sku === sku);
      if (found) return prev.map(c => (c.sku === sku ? { ...c, qty: (c.qty || 1) + 1 } : c));
      const item = equipment.find(i => i.sku === sku);
      return item ? [...prev, { ...item, category: categoryFor(item), qty: 1 }] : prev;
    });
  }, [equipment]);

  const updateQty = useCallback((sku, qty) => {
    setCart(prev =>
      prev.map(c => (c.sku === sku ? { ...c, qty: Math.max(1, qty) } : c))
    );
  }, []);

  const removeCartItem = useCallback(sku => {
    setCart(prev => prev.filter(c => c.sku !== sku));
  }, []);

  const totalCartItems = cart.reduce((sum, c) => sum + (c.qty || 1), 0);
  const cartSubtotal = cart.reduce((sum, c) => sum + parseNum(c.price) * (c.qty || 1), 0);

  const handleQuoteSubmitted = useCallback(() => setCart([]), []);

  const openQuoteFromCart = useCallback(() => {
    setCartOpen(false);
    setQuoteOpen(true);
  }, []);

  const openChat = useCallback(item => {
    setChatContext(item || null);
    setChatOpen(true);
  }, []);

  return (
    <div className="bg-white text-slate-800 antialiased">
      <Navbar cartCount={totalCartItems} onOpenCart={() => setCartOpen(true)} />
      <main>
        <Hero onRequestQuote={() => setQuoteOpen(true)} heroBackground={heroBackground} />
        <Store
          equipment={equipment}
          services={services}
          cart={cart}
          onAdd={addToCart}
          onUpdateQty={updateQty}
          onRemoveItem={removeCartItem}
          onOpenCart={() => setCartOpen(true)}
          onAsk={openChat}
        />
        <ServiceSelector />
        <NeedsGrid />
        <Availability />
        <Plans onRequestQuote={() => setQuoteOpen(true)} />
        <HowItWorks />
        <Business onRequestQuote={() => setQuoteOpen(true)} />
        <Features />
        <About />
        <FAQ />
        <CTA onRequestQuote={() => setQuoteOpen(true)} />
      </main>
      <Footer onRequestQuote={() => setQuoteOpen(true)} />
      <WhatsAppFloat />
      <ChatInquiry
        open={chatOpen}
        onOpen={() => openChat(null)}
        onClose={() => setChatOpen(false)}
        context={chatContext}
      />

      <QuoteCart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onRequestQuote={openQuoteFromCart}
        onRemove={removeCartItem}
        onUpdateQty={updateQty}
        cart={cart}
      />
      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        cart={cart}
        subtotal={cartSubtotal}
        onCartCleared={handleQuoteSubmitted}
      />
    </div>
  );
}