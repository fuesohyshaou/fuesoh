import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api.js';
import { CHAT_SUPPORT_NAME } from '../data.js';

function nowIso() {
  return new Date().toISOString();
}

function timeText(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function chipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ChatMessage({ msg }) {
  const mine = msg.sender === 'customer';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
          mine
            ? 'bg-brand text-white rounded-br-sm'
            : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
        }`}
      >
        {!mine && (
          <p className="text-[10px] font-bold text-brand mb-0.5">{CHAT_SUPPORT_NAME}</p>
        )}
        {msg.product_name && (
          <p className="text-[10px] font-semibold text-slate-400 mb-1 bg-slate-50 rounded px-2 py-1 inline-block">
            Re: {msg.product_name}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
        <p className={`text-[9px] mt-1 ${mine ? 'text-white/70' : 'text-slate-400'}`}>
          {timeText(msg.created_at)}
          {'pending' in msg && msg.pending ? ' · sending…' : ''}
        </p>
      </div>
    </div>
  );
}

export default function ChatInquiry({ open, onClose, onOpen, context }) {
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('itisep_chat_cache') || '[]');
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [typedTime, setTypedTime] = useState(nowIso());
  const knownIds = useRef(new Set());
  const sessionId = useRef('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (sessionId.current) return;
    const rand = Math.floor(100000 + Math.random() * 900000);
    sessionId.current = 'CHAT-' + rand;
  }, []);

  const applyMessage = useCallback(msg => {
    const key = msg.id != null ? String(msg.id) : msg.local;
    if (knownIds.current.has(key)) return false;
    knownIds.current.add(key);
    setMessages(prev => {
      const next = [...prev, msg].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      try { localStorage.setItem('itisep_chat_cache', JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
    return true;
  }, []);

  const load = useCallback(async () => {
    try {
      const rows = await api.getChatMessages(sessionId.current);
      (rows || []).forEach(r => applyMessage(r));
    } catch {
      // server unreachable — keep local cache
    }
  }, [applyMessage]);

  useEffect(() => {
    if (!open) return;
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [open, load]);

  const selectedProduct = useMemo(() => (context && context.name ? context : null), [context]);

  useEffect(() => {
    if (!open || messages.length > 0) return;
    const told = sessionStorage.getItem('itisep_chat_greeted') === '1';
    if (told) return;
    const msg = selectedProduct
      ? `Hello! I see you're asking about the **${selectedProduct.name}** (SKU ${selectedProduct.sku}). How can our team help you? Ask about pricing, stock or installation.`
      : `Hello! Welcome to IT-ISEP. Ask us anything about Internet plans, equipment, installation or technical support. One of our technicians will reply right here.`;
    applyMessage({
      id: 'greet',
      sender: 'agent',
      message: msg.replace(/\*\*/g, ''),
      created_at: nowIso()
    });
    sessionStorage.setItem('itisep_chat_greeted', '1');
  }, [open, messages.length, selectedProduct, applyMessage]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, open]);

  async function send(text) {
    const clean = text.trim();
    if (!clean) return;
    const localId = 'local-' + Date.now();
    const localMsg = {
      id: localId,
      local: localId,
      sender: 'customer',
      message: clean,
      product_name: selectedProduct ? selectedProduct.name : null,
      product_sku: selectedProduct ? selectedProduct.sku : null,
      created_at: nowIso(),
      pending: true
    };
    applyMessage(localMsg);
    setInput('');
    setTypedTime(nowIso());

    const reply = selectedProduct
      ? `Thanks for your message about the ${selectedProduct.name}. Our team has received your inquiry and a technician will reply here shortly.`
      : 'Thanks for reaching out to IT-ISEP. Our team has received your message and will reply here shortly.';
    setTimeout(() => {
      applyMessage({
        id: 'auto-' + Date.now(),
        sender: 'agent',
        message: reply,
        created_at: nowIso()
      });
    }, 900);

    try {
      const res = await api.sendChatMessage(sessionId.current, 'customer', clean, {
        product_sku: selectedProduct ? selectedProduct.sku : null,
        product_name: selectedProduct ? selectedProduct.name : null
      });
      if (res && res.message) applyMessage(res.message);
    } catch {
      // saved locally; server will pick it up when reachable
    }
  }

  const quickReplies = useMemo(() => {
    const base = ['I need this priced for my business', 'Is it in stock right now?', 'Do you offer installation?'];
    return selectedProduct ? base : [...base, 'What Internet plans do you offer?', 'Do I have coverage in my area?'];
  }, [selectedProduct]);

  return (
    <>
      <button
        onClick={() => (open ? onClose() : onOpen())}
        className="fixed bottom-[88px] right-6 z-40 w-14 h-14 bg-brand rounded-full flex items-center justify-center shadow-xl hover:bg-blue-600 hover:scale-105 transition text-white"
        aria-label="Start a chat with IT-ISEP"
        title="Chat with IT-ISEP"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        {open && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <div
        className={`fixed bottom-[154px] right-6 z-40 w-[calc(100vw-48px)] max-w-[380px] bg-slate-50 border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto h-[520px] max-h-[70vh]' : 'opacity-0 translate-y-4 pointer-events-none h-0'
        }`}
      >
        <div className="bg-brand-dark text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-sm font-extrabold">I</div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-brand-dark"></span>
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">IT-ISEP Live Chat</p>
              <p className="text-[10px] text-slate-300 -mt-0.5">Online · Replies within minutes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg cursor-pointer" aria-label="Close chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {selectedProduct && (
          <div className="px-4 py-2 bg-brand-light border-b border-brand/10 text-[11px] text-brand-dark flex items-center gap-1.5 shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <span>
              <span className="font-semibold">Asking about:</span> {selectedProduct.name} ({selectedProduct.sku})
            </span>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              {CHAT_SUPPORT_NAME} isn't available offline. Your messages will be sent as soon as you're online.
            </p>
          ) : (
            messages.map(msg => <ChatMessage key={msg.id ?? msg.local ?? Math.random()} msg={msg} />)
          )}
        </div>

        <div className="px-3 pt-2 pb-3 shrink-0">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {quickReplies.map(r => (
              <button
                key={r}
                onClick={() => send(r)}
                className="text-[10.5px] text-brand border border-brand/30 bg-white rounded-full px-2.5 py-1 hover:bg-brand-light transition cursor-pointer"
              >
                {r}
              </button>
            ))}
          </div>
          <form
            onSubmit={e => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-brand"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 text-sm py-1.5 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-brand hover:bg-blue-600 disabled:bg-slate-200 text-white rounded-lg w-9 h-9 flex items-center justify-center transition cursor-pointer disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 11l18-8-8 18-2-8-8-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
          <p className="text-[9px] text-slate-400 mt-1.5">Session {sessionId.current} · {typedTime}</p>
        </div>
      </div>
    </>
  );
}