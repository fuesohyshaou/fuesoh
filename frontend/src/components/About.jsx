import Reveal from './Reveal.jsx';

const checks = [
  'Professional technical expertise',
  'Local technical support',
  'Customized network solutions',
  'End-to-end installation and after-sales support',
];

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12">
        <Reveal>
          <span className="text-brand text-xs font-bold tracking-widest uppercase">About Us</span>
          <h2 className="text-3xl font-extrabold text-brand-dark mt-2 leading-tight">Who We Are</h2>
          <p className="text-slate-500 mt-4 text-sm leading-relaxed">
            IT-ISEP LTD is a Cameroonian technology company focused on Internet connectivity, fibre optic and satellite solutions, network infrastructure and IT equipment for homes, businesses and organizations.
          </p>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed">
            We are dedicated to providing reliable Internet, fibre optic, satellite, wireless networking, and professional IT solutions for homes, businesses, institutions, and organizations.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-8">
            <div className="border border-slate-100 rounded-xl p-5">
              <p className="font-semibold text-brand-dark text-sm mb-1.5">Our Mission</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                To provide reliable, professionally installed connectivity and network solutions across Cameroon.
              </p>
            </div>
            <div className="border border-slate-100 rounded-xl p-5">
              <p className="font-semibold text-brand-dark text-sm mb-1.5">Our Vision</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                To connect every home, business and community across Cameroon with fast, affordable and dependable connectivity.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <p className="font-semibold text-brand-dark text-sm mb-4">Why Choose IT-ISEP LTD.</p>
          <div className="space-y-3">
            {checks.map(c => (
              <div key={c} className="flex items-start gap-3 border border-slate-100 rounded-xl p-4">
                <svg className="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5 9-9" stroke="#169B62" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm text-slate-600">{c}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}