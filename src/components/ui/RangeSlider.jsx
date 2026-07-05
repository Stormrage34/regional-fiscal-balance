export default function RangeSlider({ label, value, onChange, min, max, unit, accentColor }) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-xs font-mono tracking-tight truncate">{label}</span>
        <span className="font-mono text-sm font-semibold ml-3 shrink-0" style={{ color: accentColor }}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        <div
          className="absolute left-0 right-auto h-1 rounded-full pointer-events-none"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${accentColor}dd, ${accentColor})`,
            boxShadow: `0 0 8px ${accentColor}30`,
          }}
        />
        <div
          className="absolute left-0 right-0 h-1 rounded-full pointer-events-none"
          style={{ background: '#334155' }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={0.1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full appearance-none cursor-pointer bg-transparent z-10 m-0"
          style={{
            accentColor,
            touchAction: 'none',
          }}
        />
      </div>
    </div>
  );
}
