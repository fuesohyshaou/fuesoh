import { Fragment, useState } from 'react';
import { api, genRequestId } from '../api.js';
import { pushItem } from '../store.js';

const inputCls = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand';

export default function QuoteModal({ open, onClose, cart, subtotal = 0, onCartCleared }) {
  const [successId, setSuccessId] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());
    setSaving(true);
    const id = genRequestId('QUOTE');
    const payload = {
      id,
      request_id: id,
      ...data,
      items: JSON.stringify(cart),
      created_at: new Date().toISOString()
    };
    try {
      await api.submitQuote(payload);
    } catch {
      pushItem('quotes', payload);
    }
    setSaving(false);
    onCartCleared();
    setSuccessId(id);
    form.reset();
  }

  return (
    <div id="quoteModalOverlay" className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8" id="quoteForm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-brand-dark">Request a Quotation</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {!successId ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input required name="name" type="text" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company</label>
                <input name="company" type="text" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input required name="phone" type="tel" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <input name="email" type="email" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location</label>
              <input name="location" type="text" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Requirements / Notes</label>
              <textarea name="notes" rows="3" className={inputCls} />
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
              {cart.length > 0 ? (
                <>
                  <span className="font-semibold text-slate-600">Items in this quote:</span>
                  <br />
                  {cart.map((c, i) => (
                    <Fragment key={c.sku}>
                      {i > 0 && <br />}• {c.name}
                      {c.qty ? <span className="text-slate-400"> × {c.qty}</span> : null}
                    </Fragment>
                  ))}
                  {subtotal > 0 && (
                    <span className="block mt-2 font-semibold text-slate-600">
                      Estimated subtotal: {subtotal.toLocaleString('en-US').replace(/,/g, ',')} FCFA
                    </span>
                  )}
                </>
              ) : (
                <span className="text-slate-400">No equipment attached — this will be a general service quote request.</span>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-brand hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50"
            >
              {saving ? 'Submitting...' : 'Submit Quotation Request'}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5 9-9" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-brand-dark">Quotation request received.</h3>
            <p className="text-slate-500 text-sm mt-2">
              Our team will review compatibility and pricing, then get back to you.
            </p>
            <p className="mt-4 inline-block bg-slate-100 text-brand-dark font-mono text-sm font-semibold px-4 py-2 rounded-lg">
              {successId}
            </p>
            <button
              onClick={() => { setSuccessId(''); onClose(); }}
              className="block mx-auto mt-5 text-sm text-brand font-semibold hover:underline cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}