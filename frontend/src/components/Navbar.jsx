import { useState } from 'react';
import { WHATSAPP_LINK } from '../data.js';
import { useAuth } from '../auth.jsx';

const navLinks = [
  { href: '#selector', label: 'Internet' },
  { href: '#selector', label: 'Fibre' },
  { href: '#selector', label: 'Satellite' },
  { href: '#business', label: 'Business Solutions' },
  { href: '#store', label: 'Equipment' },
  { href: '#store', label: 'Services' },
  { href: '#about', label: 'About Us' },
  { href: '#support', label: 'Support' },
  { href: '#contact', label: 'Contact' },
];

const dropLinks = [
  { href: '#selector', label: 'Home Internet' },
  { href: '#business', label: 'Business Internet' },
  { href: '#plans', label: 'Plans & Pricing' },
];

export default function Navbar({ cartCount, onOpenCart }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header id="top" className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 8.5C7 3.5 17 3.5 22 8.5" stroke="#0B63CE" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M5.5 12C9 8.5 15 8.5 18.5 12" stroke="#0B63CE" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M9 15.5C10.5 14 13.5 14 15 15.5" stroke="#0B63CE" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="12" cy="19.2" r="1.7" fill="#0B63CE" />
          </svg>
          <div className="leading-tight">
            <p className="font-extrabold text-lg text-brand-dark tracking-tight">
              IT-ISEP <span className="text-brand">LTD</span>
            </p>
            <p className="text-[10px] text-slate-400 -mt-1 tracking-wide">Your Trusted Connectivity Partner</p>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-7 text-[14px] font-medium text-slate-600">
          <a href="#top" className="text-brand font-semibold">Home</a>
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-brand transition cursor-pointer">
              Internet
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="absolute left-0 top-full pt-3 hidden group-hover:block w-48">
              <div className="bg-white rounded-xl shadow-xl border border-slate-100 py-2">
                {dropLinks.map(l => (
                  <a key={l.label} href={l.href} className="block px-4 py-2 text-sm hover:bg-brand-light hover:text-brand">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          {navLinks.map(l => (
            <a key={l.label} href={l.href} className="hover:text-brand transition">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <a
              href="account.html"
              className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-3.5 py-2.5 rounded-lg hover:border-brand hover:text-brand transition"
              title="My Account"
            >
              <span className="w-6 h-6 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center">
                {String(user.name || user.email || '?').charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[90px] truncate">{user.name || user.email}</span>
            </a>
          ) : (
            <a
              href="login.html"
              className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-3.5 py-2.5 rounded-lg hover:border-brand hover:text-brand transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Sign In
            </a>
          )}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-3.5 py-2.5 rounded-lg hover:border-brand hover:text-brand transition cursor-pointer"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="20" r="1.4" fill="currentColor" />
              <circle cx="18" cy="20" r="1.4" fill="currentColor" />
              <path d="M2.5 3h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Cart
            <span className="cart-badge absolute -top-2 -right-2 bg-brand text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </button>
          <a
            href="booking.html"
            className="underline underline-offset-4 decoration-cyan decoration-2 text-cyan font-semibold text-sm px-3 py-2.5 hover:text-[#00a3c1] transition"
          >
            Book a Technician
          </a>
          <a href="#availability" className="bg-brand-dark text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-800 transition">
            Get Connected
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(o => !o)}
          className="lg:hidden p-2 text-slate-700"
          aria-label="Toggle menu"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div
        className={`${mobileOpen ? 'block' : 'hidden'} lg:hidden border-t border-slate-100 bg-white px-5 py-4 space-y-3 text-sm font-medium max-h-[75vh] overflow-y-auto`}
      >
        <a href="#top" className="block py-1 text-brand">Home</a>
        <a href="#selector" className="block py-1">Internet / Fibre / Satellite</a>
        <a href="#business" className="block py-1">Business Solutions</a>
        <a href="#store" className="block py-1">Equipment</a>
        <a href="#store" className="block py-1">Services</a>
        <a href="#about" className="block py-1">About Us</a>
        <a href="#support" className="block py-1">Support</a>
        <a href="#contact" className="block py-1">Contact</a>
        <a href="booking.html" className="block py-1 font-semibold text-cyan">Book a Technician</a>
        {user ? (
          <a href="account.html" className="block py-1 font-semibold text-brand">My Account ({user.name || user.email})</a>
        ) : (
          <a href="login.html" className="block py-1 font-semibold text-brand">Sign In</a>
        )}
        <button
          onClick={() => { setMobileOpen(false); onOpenCart(); }}
          className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-lg py-2.5"
        >
          View Cart (<span>{cartCount}</span>)
        </button>
        <a href="#availability" className="block text-center bg-brand-dark text-white rounded-lg py-2.5">
          Get Connected
        </a>
      </div>
    </header>
  );
}