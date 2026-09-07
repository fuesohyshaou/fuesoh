import { howItWorks } from '../data.js';
import Reveal from './Reveal.jsx';

export default function HowItWorks() {
  return (
    <section className="bg-brand-dark py-16">
      <Reveal className="max-w-6xl mx-auto px-5 lg:px-8 text-center mb-10">
        <span className="text-cyan text-xs font-bold tracking-widest uppercase">Simple Process</span>
        <h2 className="text-3xl font-extrabold text-white mt-2">How It Works</h2>
      </Reveal>
      <div className="max-w-6xl mx-auto px-5 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {howItWorks.map(h => (
          <div key={h.step} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-cyan font-extrabold text-2xl mb-2">{h.step}</p>
            <p className="text-white font-semibold text-sm mb-1.5">{h.title}</p>
            <p className="text-slate-400 text-xs leading-relaxed">{h.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}