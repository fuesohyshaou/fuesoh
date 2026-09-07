import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../api.js';
import { dateText } from './rows.jsx';

function timeText(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function ChatAdmin() {
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const loadSessions = useCallback(async () => {
    try {
      const rows = await api.getChatSessions();
      setSessions(rows || []);
      setActive(prev => {
        if (prev && (rows || []).some(r => r.session_id === prev)) return prev;
        return (rows && rows[0] && rows[0].session_id) || null;
      });
    } catch { /* server may be missing the table */ }
  }, []);

  const loadThread = useCallback(async sid => {
    if (!sid) return;
    try {
      const rows = await api.getChatMessages(sid);
      setThread(rows || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadSessions();
    const t = setInterval(loadSessions, 8000);
    return () => clearInterval(t);
  }, [loadSessions]);

  useEffect(() => {
    loadThread(active);
    const t = setInterval(() => loadThread(active), 4000);
    return () => clearInterval(t);
  }, [active, loadThread]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread.length]);

  async function handleReply(e) {
    e.preventDefault();
    const text = reply.trim();
    if (!text || !active) return;
    setSending(true);
    try {
      await api.sendChatMessage(active, 'agent', text);
      setReply('');
      await Promise.all([loadThread(active), loadSessions()]);
    } catch (err) {
      window.alert('Reply failed: ' + (err.message || 'unknown error'));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-4 bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="border-r border-slate-100 flex flex-col max-h-[70vh]">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-[#071A2F] text-sm">Open sessions</h3>
          <span className="text-[11px] text-slate-400">{sessions.length} total</span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {sessions.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-10">No chat sessions yet.</p>
          ) : (
            sessions.map(s => (
              <button
                key={s.session_id}
                onClick={() => setActive(s.session_id)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition cursor-pointer ${
                  active === s.session_id ? 'bg-brand-light' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold text-[#0B63CE]">{s.session_id}</span>
                  {s.product_name && (
                    <span className="text-[9px] font-semibold text-[#00B8D9] bg-slate-100 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                      {s.product_name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 truncate">
                  {s.last_sender === 'customer' && (
                    <span className="font-bold text-[#0B63CE] mr-1">Customer:</span>
                  )}
                  {s.last_message}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">{dateText(s.last_at)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col max-h-[70vh]">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="font-bold text-[#071A2F] text-sm">Conversation</h3>
          {active && <p className="text-[11px] text-slate-400 font-mono mt-0.5">{active}</p>}
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {!active ? (
            <p className="text-center text-slate-400 text-xs py-10">Select a session to view messages.</p>
          ) : thread.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-10">No messages in this session.</p>
          ) : (
            thread.map(m => {
              const mine = m.sender === 'agent';
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[13px] shadow-sm ${
                      mine
                        ? 'bg-[#0B63CE] text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 rounded-bl-sm'
                    }`}
                  >
                    <p className={`text-[10px] font-bold ${mine ? 'text-white/80' : 'text-[#0B63CE]'} mb-0.5`}>
                      {mine ? 'You (Agent)' : 'Customer'}
                    </p>
                    {m.product_name && (
                      <p className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 inline-block mb-1">
                        Re: {m.product_name}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.message}</p>
                    <p className={`text-[9px] mt-1 ${mine ? 'text-white/70' : 'text-slate-400'}`}>
                      {timeText(m.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <form onSubmit={handleReply} className="p-4 border-t border-slate-100 flex items-center gap-2">
          <input
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder={active ? 'Reply to customer…' : 'Select a session first'}
            disabled={!active}
            className="flex-1 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B63CE] disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={!active || !reply.trim() || sending}
            className="bg-[#0B63CE] hover:bg-blue-600 disabled:bg-slate-200 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}