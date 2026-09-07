import { selectorCards } from '../data.js';
import Reveal from './Reveal.jsx';

export default function ServiceSelector() {
  return (
    <section id="selector" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 text-center">
        <Reveal>
          <span className="text-brand text-xs font-bold tracking-widest uppercase">Get Started</span>
          <h2 className="text-3xl font-extrabold text-brand-dark mt-2">What Connectivity Solution Do You Need?</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
            Tell us what you need — we'll point you to the right solution and check it in your area.
          </p>
        </Reveal>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {selectorCards.map(c => (
          <div key={c.title} className="rounded-2xl bg-brand-dark p-6 flex flex-col card-hover">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" dangerouslySetInnerHTML={{ __html: c.icon }} />
            </div>
            <p className="font-bold text-white mb-1.5">{c.title}</p>
            <p className="text-slate-300 text-xs leading-relaxed flex-1">{c.desc}</p>
            <a href="#availability" className="mt-4 text-cyan text-xs font-semibold hover:underline">
              {c.cta} →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}