export default function Hero({ onRequestQuote, heroBackground }) {
  const bgStyle = heroBackground
    ? {
        backgroundImage:
          'linear-gradient(100deg, rgba(4,12,32,0.95) 0%, rgba(6,16,44,0.86) 45%, rgba(8,24,64,0.55) 100%), ' +
          `url('${heroBackground}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : undefined;

  return (
    <section className="hero-bg relative overflow-hidden" style={bgStyle}>
      <div className="streak" style={{ top: '22%', width: '35%', left: '10%' }} />
      <div className="streak" style={{ top: '38%', width: '45%', left: '20%', animationDelay: '1.4s' }} />
      <div className="streak" style={{ top: '55%', width: '30%', left: '5%', animationDelay: '2.6s' }} />
      <div className="streak" style={{ top: '68%', width: '40%', left: '25%', animationDelay: '0.7s' }} />

      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center relative">
        <div className="fade-up">
          <span className="inline-block text-[11px] font-bold tracking-widest uppercase bg-white/10 text-cyan border border-white/20 rounded-full px-4 py-1.5 mb-6">
            Fast &bull; Stable &bull; Secure
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
            Connect the World. <span className="text-cyan">Reliable Internet &amp; Powerful Networks.</span>
          </h1>
          <p className="mt-6 text-slate-300 text-base sm:text-lg max-w-lg leading-relaxed">
            IT-ISEP LTD provides Internet, fibre optic, satellite, networking and IT infrastructure solutions for homes, businesses and organizations across Cameroon.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#availability" className="inline-flex items-center gap-2 bg-brand hover:bg-blue-600 text-white font-semibold px-6 py-3.5 rounded-lg transition">
              Check Availability
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <button
              onClick={onRequestQuote}
              className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-6 py-3.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              Request a Quote
            </button>
            <a
              href="booking.html"
              className="inline-flex items-center gap-2 bg-cyan text-[#04222D] font-semibold px-6 py-3.5 rounded-lg hover:bg-cyan/80 transition"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Book a Technician
            </a>
          </div>
          <a href="#store" className="inline-block mt-4 text-cyan text-sm font-medium hover:underline">
            Explore Our Store &amp; Services →
          </a>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: <path d="M13 2 3 14h7l-1 8 11-14h-7l1-6z" />, feat: ['High Speed', 'Internet'] },
              { icon: <><circle cx="7" cy="7" r="3" /><circle cx="17" cy="17" r="3" /><path d="M9.5 9.5l5 5" /></>, feat: ['Professional', 'Installation'] },
              { icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>, feat: ['24/7 Technical', 'Support'] },
              { icon: <path d="M12 2l2.5 6.5L21 9l-5 4.5L17.5 21 12 17.3 6.5 21 8 13.5 3 9l6.5-.5L12 2z" />, feat: ['Quality Equipment', 'Guaranteed'] },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <svg className="shrink-0 mt-0.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B8D9" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
                  {s.icon}
                </svg>
                <p className="text-white text-[13px] leading-tight font-medium">
                  {s.feat[0]}
                  <br />
                  {s.feat[1]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative fade-up hidden lg:block" style={{ animationDelay: '.15s' }}>
          <div className="relative bg-gradient-to-br from-white/10 to-transparent rounded-2xl p-6">
            <svg className="dish-antenna w-full h-auto drop-shadow-2xl" viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="230" cy="120" rx="140" ry="95" fill="url(#dishGrad)" stroke="#CBD5E1" strokeWidth="2" />
              <ellipse cx="230" cy="120" rx="140" ry="95" fill="none" stroke="#94A3B8" strokeWidth="1" opacity="0.5" />
              <circle cx="230" cy="120" r="6" fill="#0B63CE" />
              <rect x="150" y="30" width="8" height="90" fill="#0B63CE" transform="rotate(15 150 30)" />
              <line x1="230" y1="120" x2="150" y2="45" stroke="#334155" strokeWidth="4" />
              <rect x="215" y="150" width="30" height="130" rx="4" fill="#1E293B" />
              <rect x="140" y="220" width="90" height="60" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
              <circle cx="185" cy="250" r="14" fill="none" stroke="#0B63CE" strokeWidth="2.5" />
              <circle cx="185" cy="250" r="4" fill="#0B63CE" />
              <rect x="250" y="230" width="120" height="55" rx="6" fill="#111827" />
              <circle cx="270" cy="245" r="3" fill="#22C55E" />
              <circle cx="280" cy="245" r="3" fill="#22C55E" />
              <circle cx="290" cy="245" r="3" fill="#F59E0B" />
              <rect x="260" y="260" width="10" height="6" fill="#374151" />
              <rect x="278" y="260" width="10" height="6" fill="#374151" />
              <rect x="296" y="260" width="10" height="6" fill="#374151" />
              <rect x="314" y="260" width="10" height="6" fill="#374151" />
              <rect x="332" y="260" width="10" height="6" fill="#374151" />
              <line x1="265" y1="230" x2="260" y2="195" stroke="#1E293B" strokeWidth="3" />
              <line x1="285" y1="230" x2="285" y2="190" stroke="#1E293B" strokeWidth="3" />
              <line x1="305" y1="230" x2="312" y2="195" stroke="#1E293B" strokeWidth="3" />
              <defs>
                <linearGradient id="dishGrad" x1="90" y1="25" x2="370" y2="215" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F1F5F9" />
                  <stop offset="1" stopColor="#CBD5E1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}