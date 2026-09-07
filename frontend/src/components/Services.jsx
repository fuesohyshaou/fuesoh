import { useState } from 'react';
import { services, serviceIcons } from '../data.js';
import useCmsData from '../useCmsData.js';
import Reveal from './Reveal.jsx';

const normalizeServices = rows =>
  rows.map(r => ({ id: r.id, name: r.name, desc: r.description, tag: r.tag, image: r.image }));

export default function Services() {
  const [rows] = useCmsData('services', services, normalizeServices);
  const [broken, setBroken] = useState(() => new Set());
  const markBroken = id => setBroken(prev => new Set(prev).add(id));

  return (
    <section id="services" className="py-20">
      <Reveal className="max-w-7xl mx-auto px-5 lg:px-8 text-center">
        <span className="text-brand text-xs font-bold tracking-widest uppercase">Our Services</span>
        <h2 className="text-3xl font-extrabold text-brand-dark mt-2">Complete Connectivity &amp; IT Solutions</h2>
      </Reveal>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rows.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-400">
            Services are being updated. Check back soon.
          </div>
        )}
        {rows.map((s, i) => (
          <div key={s.id ?? s.name} className="rounded-2xl overflow-hidden border border-slate-100 card-hover">
            <div className="h-40 bg-gradient-to-br from-brand-dark to-blue-900 flex items-center justify-center relative overflow-hidden">
              {s.image && !broken.has(s.id) ? (
                <img src={s.image} alt={s.name} className="w-full h-full object-cover" onError={() => markBroken(s.id)} />
              ) : (
                <svg
                  width="46"
                  height="46"
                  viewBox="0 0 24 24"
                  fill="none"
                  dangerouslySetInnerHTML={{ __html: serviceIcons[i % serviceIcons.length] }}
                />
              )}
              {s.tag && (
                <span className="absolute top-3 left-3 text-[10px] font-bold tracking-widest text-cyan bg-white/10 px-2 py-1 rounded">
                  {s.tag}
                </span>
              )}
            </div>
            <div className="p-5">
              <p className="font-semibold text-brand-dark">{s.name}</p>
              {s.desc && <p className="text-sm text-slate-500 mt-1">{s.desc}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-10">
        <a href="#availability" className="inline-flex items-center gap-2 bg-brand hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg text-sm transition">
          Request a Service
        </a>
      </div>
    </section>
  );
}