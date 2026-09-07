import { WHATSAPP_LINK, CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from '../data.js';

export default function Footer({ onRequestQuote }) {
  return (
    <footer className="bg-[#050D22] text-slate-300 pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-10 border-b border-white/10">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M2 8.5C7 3.5 17 3.5 22 8.5" stroke="#5BC2FF" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M5.5 12C9 8.5 15 8.5 18.5 12" stroke="#5BC2FF" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M9 15.5C10.5 14 13.5 14 15 15.5" stroke="#5BC2FF" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="12" cy="19.2" r="1.7" fill="#5BC2FF" />
            </svg>
            <p className="font-extrabold text-white">
              IT-ISEP <span className="text-cyan">LTD</span>
            </p>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Internet, fibre, satellite, networking solutions and quality ISP equipment across Cameroon.
          </p>
          <div className="flex gap-3 mt-5">
            {[
              <path key="f" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />,
              <path key="i" d="M12 2.2c2.7 0 3 0 4.1.06 1.1.05 1.7.2 2.1.4.5.2.9.5 1.3.9.4.4.6.7.9 1.3.2.4.3 1 .4 2.1.05 1.1.06 1.4.06 4.1s0 3-.06 4.1c-.05 1.1-.2 1.7-.4 2.1-.2.5-.5.9-.9 1.3-.4.4-.7.6-1.3.9-.4.2-1 .3-2.1.4-1.1.05-1.4.06-4.1.06s-3 0-4.1-.06c-1.1-.05-1.7-.2-2.1-.4-.5-.2-.9-.5-1.3-.9-.4-.4-.6-.7-.9-1.3-.2-.4-.3-1-.4-2.1C2.2 15 2.2 14.7 2.2 12s0-3 .06-4.1c.05-1.1.2-1.7.4-2.1.2-.5.5-.9.9-1.3.4-.4.7-.6 1.3-.9.4-.2 1-.3 2.1-.4C8 2.2 8.3 2.2 12 2.2zm0 1.8c-2.6 0-2.9 0-4 .06-.9.04-1.4.17-1.7.3-.4.15-.7.35-1 .65-.3.3-.5.6-.65 1-.13.3-.26.8-.3 1.7-.05 1-.06 1.3-.06 3.9s0 2.9.06 3.9c.04.9.17 1.4.3 1.7.15.4.35.7.65 1 .3.3.6.5 1 .65.3.13.8.26 1.7.3 1 .05 1.3.06 4 .06s2.9 0 3.9-.06c.9-.04 1.4-.17 1.7-.3.4-.15.7-.35 1-.65.3-.3.5-.6.65-1 .13-.3.26-.8.3-1.7.05-1 .06-1.3.06-3.9s0-2.9-.06-3.9c-.04-.9-.17-1.4-.3-1.7-.15-.4-.35-.7-.65-1-.3-.3-.6-.5-1-.65-.3-.13-.8-.26-1.7-.3-1-.05-1.3-.06-3.9-.06zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.2-2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />,
              <path key="l" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18.3H5.6V9.9h2.7v8.4zM7 8.8a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2zm11.3 9.5h-2.7v-4.4c0-1 0-2.4-1.5-2.4s-1.7 1.2-1.7 2.3v4.5H9.7V9.9h2.6v1.2h.04c.36-.7 1.24-1.4 2.5-1.4 2.7 0 3.2 1.8 3.2 4.1v4.5z" />,
            ].map((path, i) => (
              <a key={i} href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-brand transition">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white">{path}</svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white font-semibold mb-4">Solutions</p>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><a href="#selector" className="hover:text-brand transition">Home Internet</a></li>
            <li><a href="#business" className="hover:text-brand transition">Business Internet</a></li>
            <li><a href="#selector" className="hover:text-brand transition">Fibre Optic</a></li>
            <li><a href="#selector" className="hover:text-brand transition">Satellite Internet</a></li>
            <li><a href="#store" className="hover:text-brand transition">Network Installation</a></li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold mb-4">Equipment</p>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><a href="#store" className="hover:text-brand transition">Routers &amp; Switches</a></li>
            <li><a href="#store" className="hover:text-brand transition">Access Points</a></li>
            <li><a href="#store" className="hover:text-brand transition">CPE Equipment</a></li>
            <li><a href="#store" className="hover:text-brand transition">Fibre Equipment</a></li>
            <li>
              <button
                type="button"
                onClick={onRequestQuote}
                className="text-left hover:text-brand transition cursor-pointer"
              >
                Request a Quote
              </button>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold mb-4">Support</p>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><a href="#support" className="hover:text-brand transition">FAQ</a></li>
            <li><a href="#availability" className="hover:text-brand transition">Check Availability</a></li>
            <li><a href="#contact" className="hover:text-brand transition">Contact Us</a></li>
            <li><a href="#about" className="hover:text-brand transition">About Us</a></li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold mb-4">Contact Us</p>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1.1L6.6 10.8z" fill="#94A3B8" />
              </svg>
              {CONTACT_PHONE_DISPLAY}
            </li>
            <li className="flex items-start gap-2.5">
              <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18v12H3z" stroke="#94A3B8" strokeWidth="1.6" />
                <path d="M3 7l9 6 9-6" stroke="#94A3B8" strokeWidth="1.6" />
              </svg>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-brand transition">{CONTACT_EMAIL}</a>
            </li>
            <li className="flex items-start gap-2.5">
              <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 21s7-6.1 7-11.4A7 7 0 1 0 5 9.6C5 14.9 12 21 12 21z" stroke="#94A3B8" strokeWidth="1.6" />
                <circle cx="12" cy="9.5" r="2.3" stroke="#94A3B8" strokeWidth="1.6" />
              </svg>
              Douala, Cameroon
            </li>
            <li className="flex items-start gap-2.5">
              <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#94A3B8" strokeWidth="1.6" />
                <path d="M12 7v5l3.5 2" stroke="#94A3B8" strokeWidth="1.6" />
              </svg>
              Mon - Sat: 8:00AM - 6:00PM
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>&copy; 2026 IT-ISEP LTD. All rights reserved.</p>
        <div className="flex gap-5">
          <a href="login.html" className="hover:text-brand transition">Sign In</a>
          <a href="register.html" className="hover:text-brand transition">Create Account</a>
        </div>
      </div>
    </footer>
  );
}