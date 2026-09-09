import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../api.js';

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';
const IMAGE_RE = /^image\/(png|jpe?g|webp|gif)$/;

const OVERLAY =
  'linear-gradient(100deg, rgba(4,12,32,0.95) 0%, rgba(6,16,44,0.86) 45%, rgba(8,24,64,0.55) 100%)';

export default function HomeSettings() {
  const [heroBackground, setHeroBackground] = useState(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const s = await api.getSettings();
      setHeroBackground(s.heroBackground || null);
    } catch {
      // server offline - keep current state
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleFile(file) {
    if (!file) return;
    if (!IMAGE_RE.test(file.type)) {
      setMessage({ type: 'error', text: 'Only PNG, JPG, WebP or GIF images are allowed.' });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'The image must be 4 MB or smaller.' });
      return;
    }
    setMessage(null);
    setBusy(true);
    try {
      const res = await api.uploadImage(file);
      await api.updateSettings({ heroBackground: res.url });
      await load();
      setMessage({ type: 'success', text: 'Home page background updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Upload failed. Check that the server is running.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!window.confirm('Remove the home page background image?')) return;
    setBusy(true);
    setMessage(null);
    try {
      await api.updateSettings({ heroBackground: null });
      await load();
      setMessage({ type: 'success', text: 'Home page background removed.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Remove failed. Check that the server is running.' });
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl() {
    if (!heroBackground) return;
    try {
      await navigator.clipboard.writeText(window.location.origin + heroBackground);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setMessage({ type: 'error', text: 'Could not copy. The image URL is shown below.' });
    }
  }

  const previewStyle = heroBackground
    ? {
        backgroundImage: `${OVERLAY}, url('${heroBackground}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {
        background:
          'linear-gradient(100deg, rgba(4,12,32,0.95) 0%, rgba(6,16,44,0.86) 45%, rgba(8,24,64,0.55) 100%), radial-gradient(circle at 75% 30%, rgba(0,184,217,0.28), transparent 55%), #050D22'
      };

  return (
    <div className="max-w-xl bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-[#071A2F]">Home Page Background</h2>
        <button
          onClick={load}
          disabled={refreshing}
          className="inline-flex items-center gap-2 text-sm text-[#0B63CE] font-semibold hover:underline cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className={refreshing ? 'animate-spin' : ''}>
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-sm text-slate-500 leading-relaxed">
          Upload the background image shown behind the hero section on the home page. The site keeps its dark gradient
          overlay on top of your photo so the text stays readable.
        </p>

        <div className="relative h-48 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center" style={previewStyle}>
          {heroBackground && (
            <span className="absolute top-2 right-2 bg-black/50 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
              Current background
            </span>
          )}
          {!heroBackground && (
            <span className="text-white/70 text-xs font-medium">No custom background — default is active</span>
          )}
        </div>

        {message && (
          <div
            className={`rounded-lg border px-3.5 py-2.5 text-sm flex items-start gap-2 ${
              message.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <span className="font-bold leading-none mt-0.5">{message.type === 'error' ? '!' : '✓'}</span>
            <span>{message.text}</span>
          </div>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current && fileRef.current.click()}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#0B63CE] hover:bg-blue-600 text-white font-semibold px-4 py-3.5 rounded-lg text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {busy ? 'Uploading…' : heroBackground ? 'Replace Home Image' : 'Upload Home Image'}
        </button>
        <input
          type="file"
          accept={ACCEPT}
          ref={fileRef}
          className="hidden"
          disabled={busy}
          onChange={e => {
            handleFile(e.target.files[0]);
            e.target.value = '';
          }}
        />
        {heroBackground && !busy && (
          <button
            type="button"
            onClick={handleRemove}
            className="w-full text-sm text-red-600 hover:text-red-700 font-semibold border border-red-200 hover:bg-red-50 rounded-lg px-4 py-2.5 cursor-pointer"
          >
            Remove background
          </button>
        )}

        {heroBackground && (
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3.5 py-3 flex items-center gap-2">
            <input
              readOnly
              value={window.location.origin + heroBackground}
              onFocus={e => e.target.select()}
              className="w-full bg-transparent text-xs text-slate-500 font-mono focus:outline-none"
            />
            <button
              type="button"
              onClick={copyUrl}
              className="shrink-0 text-[11px] font-semibold text-[#0B63CE] border border-[#0B63CE] hover:bg-[#0B63CE] hover:text-white rounded-lg px-3 py-1.5 cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
        )}

        <p className="text-[11px] text-slate-400">PNG, JPG, WebP or GIF. Max 4 MB.</p>
      </div>
    </div>
  );
}