import { businessServices } from '../data.js';
import Reveal from './Reveal.jsx';

export default function Business({ onRequestQuote }) {
  return (
    <section id="business" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <span className="text-brand text-xs font-bold tracking-widest uppercase">Business Solutions</span>
          <h2 className="text-3xl font-extrabold text-brand-dark mt-2 leading-tight">
            Connectivity &amp; Network Infrastructure for Organizations
          </h2>
          <p className="text-slate-500 mt-4 text-sm leading-relaxed">
            Dedicated Internet, business fibre, structured cabling, Wi-Fi deployment, point-to-point wireless links, network security, VPN, firewalls and maintenance contracts — designed around how your organization actually works.
          </p>

          <div className="flex flex-wrap gap-2 mt-6">
            {['SMEs', 'Large Companies', 'NGOs', 'Schools', 'Hotels', 'Government', 'Construction Sites', 'ISPs'].map(t => (
              <span key={t} className="text-xs font-medium bg-brand-light text-brand px-3 py-1.5 rounded-full">
                {t}
              </span>
            ))}
          </div>

          <button
            onClick={onRequestQuote}
            className="inline-flex items-center gap-2 mt-8 bg-brand hover:bg-blue-600 text-white font-semibold px-6 py-3.5 rounded-lg transition cursor-pointer"
          >
            Talk to a Network Engineer
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Reveal>

        <Reveal className="grid grid-cols-2 gap-4">
          {businessServices.map(s => (
            <div key={s} className="border border-slate-100 rounded-xl p-4 flex items-center gap-2.5 card-hover">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path d="M5 12l5 5 9-9" stroke="#0B63CE" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-medium text-slate-700">{s}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}