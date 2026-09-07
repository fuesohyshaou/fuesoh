import { useMemo } from 'react';

function parseNum(v) {
  return Number(String(v ?? '').replace(/[^\d]/g, '')) || 0;
}

function fmt(v) {
  return String(v ?? '').replace(/[^\d]/g, '');
}

export default function QuoteCart({ open, onClose, onRequestQuote, onRemove, onUpdateQty, cart }) {
  const subtotal = useMemo(
    () => cart.reduce((sum, c) => sum + parseNum(c.price) * (c.qty || 1), 0),
    [cart]
  );
  const totalItems = cart.reduce((sum, c) => sum + (c.qty || 1), 0);

  return (
    <>
      <div
        id="cartOverlay"
        className={`${open ? '' : 'hidden'} fixed inset-0 bg-black/50 z-50`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p className="font-bold text-brand-dark">
            Your Cart
            {totalItems > 0 && (
              <span className="ml-2 text-xs font-semibold text-slate-400">
                {totalItems} item{totalItems > 1 ? 's' : ''}
              </span>
            )}
          </p>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">
              Your cart is empty. Add equipment from the Equipment Store.
            </p>
          ) : (
            cart.map(item => (
              <div key={item.sku} className="flex items-start gap-3 border border-slate-100 rounded-xl p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 leading-snug">{item.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    SKU: {item.sku} · {item.price} FCFA each
                  </p>
                  {item.category && (
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => (item.qty === 1 ? onRemove(item.sku) : onUpdateQty(item.sku, (item.qty || 1) - 1))}
                        className="w-7 h-7 text-slate-500 hover:bg-slate-100 cursor-pointer"
                        aria-label={`Decrease ${item.name}`}
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-xs font-semibold text-brand-dark tabular-nums">
                        {item.qty || 1}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.sku, (item.qty || 1) + 1)}
                        className="w-7 h-7 text-slate-500 hover:bg-slate-100 cursor-pointer"
                        aria-label={`Increase ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <span className="ml-auto text-xs font-bold text-brand-dark">
                      {fmt(parseNum(item.price) * (item.qty || 1))} FCFA
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(item.sku)}
                  className="text-slate-400 hover:text-red-500 shrink-0 cursor-pointer"
                  aria-label={`Remove ${item.name}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-slate-100 p-5 space-y-3">
          {cart.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal ({totalItems} item{totalItems > 1 ? 's' : ''})</span>
              <span className="font-bold text-brand-dark">{fmt(subtotal)} FCFA</span>
            </div>
          )}
          <button
            onClick={onRequestQuote}
            disabled={cart.length === 0}
            className="w-full bg-brand hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Request Quotation
          </button>
          <p className="text-[10px] text-slate-400 text-center">
            Prices are indicative. Final pricing is confirmed by our team after your quotation request.
          </p>
        </div>
      </div>
    </>
  );
}