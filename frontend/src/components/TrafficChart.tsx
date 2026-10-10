interface Point { hour: string; requests: number; errors: number }

// Grafik SVG sederhana tanpa dependensi: area untuk request, garis untuk error.
export function TrafficChart({ data }: { data: Point[] }) {
  const W = 320, H = 150, L = 28, R = 6, T = 8, B = 20;
  const max = Math.max(4, ...data.map((d) => d.requests));
  const top = Math.ceil(max / 4) * 4;
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(1, data.length - 1);
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const line = (key: 'requests' | 'errors') => data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(' ');
  const area = `${line('requests')} L${x(data.length - 1).toFixed(1)},${y(0)} L${x(0)},${y(0)} Z`;
  const total = data.reduce((s, d) => s + d.requests, 0);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Grafik request 24 jam terakhir, total ${total}`} preserveAspectRatio="none">
      {[0, 1, 2, 3, 4].map((i) => {
        const v = (top / 4) * i;
        return (
          <g key={i}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="chart-grid" />
            <text x={L - 4} y={y(v) + 3} textAnchor="end" className="chart-tick">{Math.round(v)}</text>
          </g>
        );
      })}
      {data.map((d, i) => (i % 4 === 0 ? <text key={d.hour} x={x(i)} y={H - 6} textAnchor="middle" className="chart-tick">{d.hour}</text> : null))}
      <path d={area} className="chart-area" />
      <path d={line('requests')} className="chart-line" fill="none" />
      <path d={line('errors')} className="chart-err" fill="none" />
    </svg>
  );
}
