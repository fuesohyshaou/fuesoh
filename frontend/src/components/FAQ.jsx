import { useState } from 'react';
import { faqs } from '../data.js';
import Reveal from './Reveal.jsx';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section id="support" className="py-20 bg-slate-50">
      <Reveal className="max-w-3xl mx-auto px-5 lg:px-8 text-center mb-10">
        <span className="text-brand text-xs font-bold tracking-widest uppercase">Support</span>
        <h2 className="text-3xl font-extrabold text-brand-dark mt-2">Frequently Asked Questions</h2>
      </Reveal>
      <div className="max-w-3xl mx-auto px-5 lg:px-8 space-y-3">
        {faqs.map((f, i) => (
          <div key={f.q} className={`accordion-item bg-white border border-slate-200 rounded-xl overflow-hidden ${openIdx === i ? 'open' : ''}`}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="accordion-toggle w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
            >
              <span className="text-sm font-semibold text-brand-dark pr-4">{f.q}</span>
              <svg className="chev shrink-0 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#0B63CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="accordion-panel px-5">
              <p className="text-sm text-slate-500 pb-4 leading-relaxed">{f.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}