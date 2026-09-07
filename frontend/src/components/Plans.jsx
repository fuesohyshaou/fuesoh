import { plans } from '../data.js';
import Reveal from './Reveal.jsx';

export default function Plans({ onRequestQuote }) {
  return (
    <section id="plans" className="bg-slate-50 pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-[1fr_2.4fr] gap-10 items-center">
        <Reveal>
          <span className="text-brand text-xs font-bold tracking-widest uppercase">Internet Plans</span>
          <h2 className="text-3xl font-extrabold text-brand-dark mt-2 leading-tight">
            Fast &amp; Affordable Internet for <span className="text-brand">Every Need</span>
          </h2>
          <p className="text-slate-500 mt-4 text-sm leading-relaxed">
            Choose the perfect plan for your home, business or organization. Need something custom? Request a quote instead.
          </p>
          <button
            onClick={onRequestQuote}
            className="mt-6 bg-brand-dark hover:bg-slate-800 text-white font-semibold px-5 py-3 rounded-lg text-sm transition cursor-pointer"
          >
            Request Pricing
          </button>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map(p => (
            <div
              key={p.name}
              className={`relative bg-white rounded-2xl border ${p.popular ? 'border-brand ring-2 ring-brand' : 'border-slate-200'} p-6 flex flex-col card-hover`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-bold tracking-wide px-3 py-1 rounded-full">
                  POPULAR
                </span>
              )}
              <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center mb-4 mx-auto">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M2 8.5C7 3.5 17 3.5 22 8.5" stroke="#0B63CE" strokeWidth="2" strokeLinecap="round" />
                  <path d="M5.5 12C9 8.5 15 8.5 18.5 12" stroke="#0B63CE" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="18" r="1.6" fill="#0B63CE" />
                </svg>
              </div>
              <p className="text-center text-sm font-semibold text-slate-500">{p.name}</p>
              <p className="text-center text-lg font-bold text-brand-dark mt-1 mb-4">{p.speed}</p>
              <ul className="text-xs text-slate-500 space-y-2 mb-5">
                {['Unlimited Data', '24/7 Support', 'Free Installation'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5 9-9" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto text-center">
                <p className="text-2xl font-extrabold text-brand-dark">
                  {p.price} <span className="text-xs font-medium text-slate-400">FCFA</span>
                </p>
                <p className="text-[11px] text-slate-400 mb-4">/ Month</p>
                <a href="#availability" className="block w-full bg-brand hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg transition">
                  Subscribe
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}