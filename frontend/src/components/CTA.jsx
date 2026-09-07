import { WHATSAPP_LINK } from '../data.js';

export default function CTA({ onRequestQuote }) {
  return (
    <section id="contact" className="relative overflow-hidden">
      <div className="hero-bg absolute inset-0" />
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to Get Connected?</h2>
          <p className="text-slate-300 mt-2 text-sm sm:text-base">
            Request a service, ask for a quote or talk to our team today. Mon–Sat, 8:00AM–6:00PM.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={WHATSAPP_LINK}
            className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold px-5 py-3 rounded-lg hover:bg-white/10 transition text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
            </svg>
            Chat on WhatsApp
          </a>
          <button
            onClick={onRequestQuote}
            className="inline-flex items-center gap-2 bg-brand hover:bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg transition text-sm cursor-pointer"
          >
            Request a Quote
          </button>
          <a href="#availability" className="inline-flex items-center gap-2 bg-cyan hover:brightness-95 text-white font-semibold px-5 py-3 rounded-lg transition text-sm">
            Get Support
          </a>
        </div>
      </div>
    </section>
  );
}