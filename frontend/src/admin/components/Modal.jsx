import { useEffect, useRef, useState } from 'react';
import { api } from '../../api.js';

const inputCls = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B63CE]';

const FIELD_SETS = {
  equipment: {
    titleAdd: 'Add Equipment',
    titleEdit: 'Edit Equipment',
    submit: 'Save Equipment',
    fields: row => [
      { name: 'name', label: 'Name', required: true, placeholder: 'e.g. MikroTik hEX S Router', value: row?.name || '' },
      { name: 'price', label: 'Price (FCFA)', required: true, placeholder: 'e.g. 45,000', value: row?.price || '' },
      { name: 'sku', label: 'SKU', placeholder: 'e.g. RTR-001', value: row?.sku || '' },
      { name: 'image', label: 'Equipment Image', kind: 'image', value: row?.image || '' }
    ]
  },
  services: {
    titleAdd: 'Add Service',
    titleEdit: 'Edit Service',
    submit: 'Save Service',
    fields: row => [
      { name: 'name', label: 'Name', required: true, placeholder: 'e.g. Fibre Optic Solutions', value: row?.name || '' },
      { name: 'description', label: 'Description', placeholder: 'Short description', kind: 'textarea', value: row?.description || '' },
      { name: 'tag', label: 'Tag', placeholder: 'e.g. FIBRE', value: row?.tag || '' },
      { name: 'image', label: 'Service Image', kind: 'image', value: row?.image || '' }
    ]
  }
};

export default function Modal({ kind, row, onClose, onSaved }) {
  const cfg = FIELD_SETS[kind];
  const fields = cfg.fields(row);
  const [form, setForm] = useState(() =>
    Object.fromEntries(fields.map(f => [f.name, f.value || '']))
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState(null);
  const [pickedFiles, setPickedFiles] = useState({});
  const [previews, setPreviews] = useState(() =>
    Object.fromEntries(fields.filter(f => f.kind === 'image').map(f => [f.name, f.value || null]))
  );
  const fileRefs = useRef({});
  const fieldLabels = Object.fromEntries(fields.map(f => [f.name, f.label]));

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }

  function handleFile(name, file) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) {
      setError(`${fieldLabels[name]}: only PNG, JPG, WebP or GIF images are allowed.`);
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError(`${fieldLabels[name]}: image must be 4 MB or smaller.`);
      return;
    }
    setError(null);
    setPickedFiles(prev => ({ ...prev, [name]: file }));
    const reader = new FileReader();
    reader.onload = ev => {
      setPreviews(prev => ({ ...prev, [name]: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  function removeImage(name) {
    setPickedFiles(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setPreviews(prev => ({ ...prev, [name]: null }));
    setForm(prev => {
      const next = { ...prev };
      next[name] = row && row[name] != null ? row[name] : '';
      return next;
    });
    if (fileRefs.current[name]) fileRefs.current[name].value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const data = { ...form };
      for (const f of fields.filter(f => f.kind === 'image')) {
        const file = pickedFiles[f.name];
        if (file) {
          setUploading(f.name);
          try {
            const res = await api.uploadImage(file);
            data[f.name] = res.url;
            setPickedFiles(prev => {
              const next = { ...prev };
              delete next[f.name];
              return next;
            });
          } finally {
            setUploading(null);
          }
        } else if (!data[f.name]) {
          delete data[f.name];
        }
      }
      if (row) {
        if (kind === 'equipment') await api.updateEquipment(row.id, data);
        else await api.updateService(row.id, data);
      } else {
        if (kind === 'equipment') await api.createEquipment(data);
        else await api.createService(data);
      }
      await onSaved();
    } catch (err) {
      setError(err.message || 'The save could not be completed. Check that the server is running.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-[#071A2F]">{row ? cfg.titleEdit : cfg.titleAdd}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700 flex items-start gap-2">
              <span className="text-red-500 font-bold leading-none mt-0.5">!</span>
              <span>{error}</span>
            </div>
          )}
          {fields.map(f => (
            <Field
              key={f.name}
              field={f}
              value={form[f.name]}
              preview={previews[f.name]}
              busy={uploading === f.name}
              onChange={handleChange}
              onFile={file => handleFile(f.name, file)}
              onRemove={() => removeImage(f.name)}
              inputRef={el => { fileRefs.current[f.name] = el; }}
            />
          ))}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#0B63CE] hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving
              ? (uploading ? 'Uploading image…' : 'Saving…')
              : cfg.submit}
          </button>
          <p className="text-[11px] text-slate-400 text-center">Images are uploaded to and stored on the server.</p>
        </form>
      </div>
    </div>
  );
}

function Field({ field, value, preview, busy, onChange, onFile, onRemove, inputRef }) {
  const label = (
    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
      {field.label}{field.required ? <span className="text-red-500">*</span> : ''}
    </label>
  );

  if (field.kind === 'image') {
    return (
      <div>
        {label}
        <label className="cursor-pointer inline-flex items-center gap-2 border border-dashed border-slate-300 hover:border-[#0B63CE] rounded-lg px-4 py-2.5 text-sm text-slate-500 transition w-full justify-center disabled:opacity-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span>{preview ? 'Replace image' : 'Choose & upload image from device'}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            ref={inputRef}
            disabled={busy}
            onChange={e => {
              onFile(e.target.files[0]);
              e.target.value = '';
            }}
          />
        </label>
        {busy && (
          <p className="text-[11px] text-[#0B63CE] mt-1.5 animate-pulse">Uploading…</p>
        )}
        {(preview || busy) && (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={preview}
              className="w-24 h-24 object-contain bg-slate-50 rounded-lg border border-slate-200"
              alt={field.label}
            />
            {!busy && (
              <button
                type="button"
                onClick={onRemove}
                className="text-xs text-red-600 hover:text-red-700 font-semibold border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 cursor-pointer"
              >
                Remove image
              </button>
            )}
          </div>
        )}
        <p className="text-[11px] text-slate-400 mt-1.5">Click the button to pick a photo from your device. Max 4 MB.</p>
      </div>
    );
  }

  if (field.kind === 'textarea') {
    return (
      <div>
        {label}
        <textarea
          name={field.name}
          rows="3"
          placeholder={field.placeholder || ''}
          value={value}
          onChange={onChange}
          className={inputCls}
        />
      </div>
    );
  }

  return (
    <div>
      {label}
      <input
        name={field.name}
        type="text"
        value={value}
        placeholder={field.placeholder || ''}
        onChange={onChange}
        className={inputCls}
      />
    </div>
  );
}