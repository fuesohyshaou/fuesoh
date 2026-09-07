import { useState } from 'react';
import { cities } from '../data.js';
import { api, genRequestId } from '../api.js';
import Reveal from './Reveal.jsx';

const inputCls = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand';

export default function Availability() {
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());
    setSaving(true);
    const id = genRequestId('ITISEP');
    const payload = { request_id: id, ...data, created_at: new Date().toISOString() };
    try {
      await api.submitAvailability(payload);
      setRequestId(id);
      setSubmitted(true);
    } catch (err) {
      window.alert('Could not submit your request: ' + (err.message || 'server unavailable'));
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setSubmitted(false);
    setRequestId('');
  }

  return (
    <section id="availability" className="py-20 bg-brand-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(0,184,217,0.25), transparent 45%)' }} />
      <div className="max-w-5xl mx-auto px-5 lg:px-8 relative">
        <Reveal className="text-center mb-10">
          <span className="text-cyan text-xs font-bold tracking-widest uppercase">Step 1</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">Check Service Availability</h2>
          <p className="text-slate-300 mt-3 max-w-xl mx-auto text-sm">
            Tell us where you're located. Our technical team will verify coverage and contact you.
          </p>
        </Reveal>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10">
          {!submitted ? (
            <form onSubmit={handleSubmit} id="availabilityForm" className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input required name="name" type="text" placeholder="e.g. Marie Ngo" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input required name="phone" type="tel" placeholder="+237 6XX XXX XXX" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                <input name="email" type="email" placeholder="you@example.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <select required name="city" defaultValue="" className={inputCls}>
                  <option value="">Select city</option>
                  {cities.map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Neighborhood / Quarter</label>
                <input name="neighborhood" type="text" placeholder="e.g. Bastos" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address / Landmark</label>
                <input name="address" type="text" placeholder="Street, landmark or GPS pin" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Service Required <span className="text-red-500">*</span>
                </label>
                <select required name="service" defaultValue="" className={inputCls}>
                  <option value="">Select service</option>
                  <option>Fibre Internet</option>
                  <option>Wireless Internet</option>
                  <option>Satellite Internet</option>
                  <option>Business Internet</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Preferred Contact Method</label>
                <div className="flex gap-4 mt-2.5 text-sm text-slate-600">
                  <label className="flex items-center gap-1.5">
                    <input type="radio" name="contact_method" value="Phone Call" defaultChecked className="accent-brand" />
                    Phone Call
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="radio" name="contact_method" value="WhatsApp" className="accent-brand" />
                    WhatsApp
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="radio" name="contact_method" value="Email" className="accent-brand" />
                    Email
                  </label>
                </div>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-brand hover:bg-blue-600 text-white font-semibold py-3.5 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Checking...' : 'Check My Location'}
                </button>
                <p className="text-[11px] text-slate-400 mt-2 text-center">
                  By submitting, you agree to be contacted by IT-ISEP LTD about this request.
                </p>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5 9-9" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-brand-dark">Thank you. Your request has been received.</h3>
              <p className="text-slate-500 text-sm mt-2">
                Our technical team will verify coverage and contact you shortly.
              </p>
              <p className="mt-4 inline-block bg-slate-100 text-brand-dark font-mono text-sm font-semibold px-4 py-2 rounded-lg">
                {requestId}
              </p>
              <div>
                <button onClick={reset} className="mt-5 text-sm text-brand font-semibold hover:underline cursor-pointer">
                  Submit another request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}