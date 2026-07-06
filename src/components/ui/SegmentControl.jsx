export default function SegmentControl({ value, onChange, segments }) {
  return (
    <div className="inline-flex flex-wrap rounded-lg bg-slate-900/60 border border-slate-700/40 p-0.5 gap-0.5">
      {segments.map((seg) => (
        <button
          key={seg.value}
          type="button"
          onClick={() => onChange(seg.value)}
          className={`
            px-3 py-2 text-xs font-mono rounded-md transition-all duration-200 whitespace-nowrap relative min-h-[40px]
            ${value === seg.value
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.07]'}
          `}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}
