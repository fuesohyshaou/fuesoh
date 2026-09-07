export default function Stats({ data }) {
  const cards = [
    { label: 'Availability checks', value: data.availability.length },
    { label: 'Quote requests', value: data.quotes.length },
    { label: 'Equipment items', value: data.equipment.length },
    { label: 'Services', value: data.services.length }
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-2xl font-extrabold text-[#071A2F]">{c.value}</p>
          <p className="text-xs text-slate-500 mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
