import { needs } from '../data.js';
import Reveal from './Reveal.jsx';

export default function NeedsGrid() {
  return (
    <section className="relative z-10">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-10">
          <Reveal>
            <h2 className="text-center text-xl sm:text-2xl font-bold text-brand-dark mb-8">
              Every Service, One Partner
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {needs.map(n => (
              <button
                key={n.label}
                type="button"
                className="group flex flex-col items-center text-center gap-3 border border-slate-200 rounded-xl py-6 px-2 card-hover cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-brand-light">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" dangerouslySetInnerHTML={{ __html: n.icon }} />
                </div>
                <p className="text-[13px] font-semibold text-slate-700 whitespace-pre-line leading-tight">{n.label}</p>
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href="#availability" className="inline-flex items-center gap-2 bg-brand hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition">
              Request a Service
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}