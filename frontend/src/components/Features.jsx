import { features } from '../data.js';

export default function Features() {
  return (
    <section className="bg-brand-dark py-14">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 text-center mb-8">
        <h2 className="text-white font-bold text-xl">Why Choose IT-ISEP LTD.?</h2>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {features.map(f => (
          <div key={f.title} className="flex flex-col items-center text-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" dangerouslySetInnerHTML={{ __html: f.icon }} />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{f.title}</p>
              <p className="text-slate-400 text-xs mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}