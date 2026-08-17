import React from 'react';

// ── Line Chart: Tiger Sightings Over Time ─────────────────────────
export function SightingsLineChart({ data = [] }) {
  const chartHeight = 180;
  const chartWidth = 500;
  const padding = 35;

  if (data.length === 0) {
    return <div className="chart-empty font-mono">Telemetry stream pending...</div>;
  }

  // Calculate scales
  const maxVal = Math.max(...data.map(d => d.count), 5);
  const minVal = 0;
  const valRange = maxVal - minVal;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - ((d.count - minVal) / valRange) * (chartHeight - padding * 2);
    return { x, y, label: d.date, count: d.count };
  });

  // Build path string
  let pathStr = '';
  if (points.length > 0) {
    pathStr = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Add smooth bezier curves
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      pathStr += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }
  }

  // Build closed area path for fill
  const areaPathStr = points.length > 0 
    ? `${pathStr} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : '';

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full select-none overflow-visible">
        <defs>
          <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding + ratio * (chartHeight - padding * 2);
          const gridVal = Math.round(maxVal - ratio * valRange);
          return (
            <g key={idx} className="opacity-20">
              <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#1e2d3d" strokeWidth="1" strokeDasharray="3 3" />
              <text x={padding - 8} y={y + 4} fill="#9ca3af" fontSize="9" fontFamily="monospace" textAnchor="end">{gridVal}</text>
            </g>
          );
        })}

        {/* Glowing Filled Area */}
        {areaPathStr && <path d={areaPathStr} fill="url(#lineGlow)" />}

        {/* Stroke Line */}
        {pathStr && (
          <path
            d={pathStr}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]"
          />
        )}

        {/* Interactive Dots */}
        {points.map((pt, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
            <circle cx={pt.x} cy={pt.y} r="8" fill="#10b981" className="opacity-0 group-hover:opacity-20 transition-opacity" />
            
            {/* Simple label hover tooltip */}
            <text
              x={pt.x}
              y={pt.y - 12}
              fill="#ffffff"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
              className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold bg-black/80 px-1 py-0.5 rounded"
            >
              {pt.count}
            </text>

            {/* X-axis labels */}
            {idx % Math.ceil(data.length / 5) === 0 && (
              <text
                x={pt.x}
                y={chartHeight - 8}
                fill="#6b7280"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {pt.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Donut Chart: Alerts by Severity ──────────────────────────────
export function AlertsDonutChart({ data = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 } }) {
  const size = 180;
  const radius = 60;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const severities = [
    { label: 'CRITICAL', value: data.CRITICAL || 0, color: '#ef4444' },
    { label: 'HIGH', value: data.HIGH || 0, color: '#f59e0b' },
    { label: 'MEDIUM', value: data.MEDIUM || 0, color: '#3b82f6' },
    { label: 'LOW', value: data.LOW || 0, color: '#10b981' }
  ];

  const total = severities.reduce((sum, item) => sum + item.value, 0);

  let accumulatedAngle = -90; // Start from top

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full font-mono text-stone-500 text-xs">
        No Alert Telemetry
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full h-full gap-4">
      {/* SVG Donut */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none overflow-visible">
        {/* Base track circle */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />

        {/* Draw donut segments */}
        {severities.map((item, idx) => {
          if (item.value === 0) return null;
          const ratio = item.value / total;
          const strokeLength = ratio * circumference;
          const strokeOffset = circumference - strokeLength;
          const rotationAngle = accumulatedAngle;
          
          accumulatedAngle += ratio * 360;

          return (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              transform={`rotate(${rotationAngle} ${center} ${center})`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}

        {/* Center Text label */}
        <text x={center} y={center - 2} fill="#ffffff" fontSize="16" fontFamily="var(--font-mono)" fontWeight="800" textAnchor="middle">
          {total}
        </text>
        <text x={center} y={center + 12} fill="#6b7280" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="1" textAnchor="middle">
          TOTAL ALERTS
        </text>
      </svg>

      {/* Legend Column */}
      <div className="flex flex-col gap-2 flex-grow pr-4">
        {severities.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-stone-400 font-mono">{item.label}</span>
            </div>
            <span className="font-bold text-white font-mono">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar Chart: Tiger Sighting Activity ────────────────────────────
export function TigerActivityBarChart({ data = [] }) {
  const chartHeight = 160;
  const chartWidth = 400;
  const paddingLeft = 45;
  const paddingBottom = 25;
  const paddingTop = 15;
  const paddingRight = 15;

  if (data.length === 0) {
    return <div className="chart-empty font-mono">Catalog sync pending...</div>;
  }

  const maxVal = Math.max(...data.map(d => d.count), 4);
  const valRange = maxVal;

  const barWidth = ((chartWidth - paddingLeft - paddingRight) / data.length) * 0.6;
  const barSpacing = ((chartWidth - paddingLeft - paddingRight) / data.length) * 0.4;

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full select-none overflow-visible">
        {/* Y Axis grid ticks */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingTop + ratio * (chartHeight - paddingTop - paddingBottom);
          const gridVal = Math.round(maxVal - ratio * valRange);
          return (
            <g key={idx} className="opacity-15">
              <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#1e2d3d" strokeWidth="1" />
              <text x={paddingLeft - 8} y={y + 3} fill="#9ca3af" fontSize="9" fontFamily="monospace" textAnchor="end">{gridVal}</text>
            </g>
          );
        })}

        {/* Draw Bars */}
        {data.map((item, idx) => {
          const x = paddingLeft + idx * (barWidth + barSpacing) + barSpacing / 2;
          const barHeight = (item.count / valRange) * (chartHeight - paddingTop - paddingBottom);
          const y = chartHeight - paddingBottom - barHeight;

          return (
            <g key={idx} className="group cursor-pointer">
              {/* Sighting count label above bar */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                fill="#ffffff"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
                className="opacity-0 group-hover:opacity-100 transition-opacity font-bold"
              >
                {item.count}
              </text>

              {/* Bar Rect */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                fill={item.color || '#10b981'}
                rx="3"
                className="transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:brightness-110"
                style={{
                  filter: `drop-shadow(0 0 4px ${item.color || '#10b981'}55)`
                }}
              />

              {/* Tiger Label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight - 8}
                fill="#9ca3af"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {item.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Horizontal Bar Chart: Zone Activity ────────────────────────────
export function ZoneActivityBarChart({ data = [] }) {
  const chartHeight = 150;
  const chartWidth = 400;
  const paddingLeft = 85;
  const paddingRight = 35;
  const rowHeight = (chartHeight - 20) / Math.max(data.length, 1);

  if (data.length === 0) {
    return <div className="chart-empty font-mono">Zone sensor feed offline</div>;
  }

  const maxVal = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full select-none overflow-visible">
        {data.map((item, idx) => {
          const y = 10 + idx * rowHeight + (rowHeight - 14) / 2;
          const barMaxWidth = chartWidth - paddingLeft - paddingRight;
          const barWidth = (item.count / maxVal) * barMaxWidth;

          return (
            <g key={idx} className="group cursor-pointer">
              {/* Zone label */}
              <text
                x={paddingLeft - 10}
                y={y + 10}
                fill="#9ca3af"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
                className="font-bold"
              >
                {item.zone}
              </text>

              {/* Glow backdrop */}
              <rect
                x={paddingLeft}
                y={y}
                width={Math.max(barWidth, 4)}
                height="10"
                fill="#06b6d4"
                rx="2"
                className="opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ filter: 'blur(3px)' }}
              />

              {/* Sighting count Bar */}
              <rect
                x={paddingLeft}
                y={y}
                width={Math.max(barWidth, 4)}
                height="10"
                fill="url(#barGradient)"
                rx="2"
                className="opacity-80 group-hover:opacity-100 transition-opacity"
              />

              {/* Numeric value label */}
              <text
                x={paddingLeft + barWidth + 8}
                y={y + 9}
                fill="#06b6d4"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="700"
              >
                {item.count}
              </text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
