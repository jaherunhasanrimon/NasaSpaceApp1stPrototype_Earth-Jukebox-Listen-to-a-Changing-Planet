import React, { useMemo, useRef, useCallback } from 'react';
import type { TemperatureDataPoint } from '../data/gistempAnnual';
import { gistempAnnual } from '../data/gistempAnnual';
import './TemperatureChart.css';

interface TemperatureChartProps {
  data?: TemperatureDataPoint[];
  progress: number; // 0 to 1
  onSeek?: (progress: number) => void;
  ariaLabel?: string;
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  data = gistempAnnual,
  progress = 0,
  onSeek,
  ariaLabel = 'NASA GISTEMP v4 Global Surface Temperature Anomaly chart (1880–2025)',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Chart dimensions & margins
  const width = 960;
  const height = 380;
  const margin = { top: 30, right: 35, bottom: 50, left: 60 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Domain & scales
  const minYear = data[0]?.year ?? 1880;
  const maxYear = data[data.length - 1]?.year ?? 2025;
  const minAnomaly = -0.6; // headroom below -0.48 min
  const maxAnomaly = 1.4; // headroom above 1.29 max

  // Coordinate transforms
  const getX = useCallback(
    (year: number) => {
      const ratio = (year - minYear) / (maxYear - minYear);
      return margin.left + ratio * plotWidth;
    },
    [minYear, maxYear, margin.left, plotWidth]
  );

  const getY = useCallback(
    (anomaly: number) => {
      const ratio = (anomaly - minAnomaly) / (maxAnomaly - minAnomaly);
      return margin.top + (1 - ratio) * plotHeight;
    },
    [minAnomaly, maxAnomaly, margin.top, plotHeight]
  );

  const baselineY = getY(0.0);

  // Current year & anomaly derived from progress
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const currentFractionalIndex = clampedProgress * (data.length - 1);
  const currentIndex = Math.min(
    data.length - 1,
    Math.max(0, Math.round(currentFractionalIndex))
  );
  const currentPoint = data[currentIndex] ?? data[0];

  const cursorX = margin.left + clampedProgress * plotWidth;
  const cursorY = getY(currentPoint.anomalyC);

  // Generate SVG path strings
  const { linePath, areaPathWarm } = useMemo(() => {
    if (data.length === 0) return { linePath: '', areaPathWarm: '' };

    const pts = data.map((d) => ({
      x: getX(d.year),
      y: getY(d.anomalyC),
      val: d.anomalyC,
    }));

    // Line path
    const lineSegments = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    const linePath = lineSegments.join(' ');

    // Full area fill under curve to baseline
    const areaWarm = [
      `M ${pts[0].x.toFixed(1)},${baselineY.toFixed(1)}`,
      ...pts.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `L ${pts[pts.length - 1].x.toFixed(1)},${baselineY.toFixed(1)}`,
      'Z',
    ].join(' ');

    return {
      linePath,
      areaPathWarm: areaWarm,
    };
  }, [data, getX, getY, baselineY]);

  // Y-axis grid ticks (-0.4, -0.2, 0.0, +0.2, +0.4, +0.6, +0.8, +1.0, +1.2 °C)
  const yTicks = [-0.4, -0.2, 0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2];

  // X-axis decadal ticks
  const xTicks = [1880, 1900, 1920, 1940, 1960, 1980, 2000, 2025];

  // Handling click / scrub on chart
  const handleSeekFromEvent = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!onSeek || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clickX = clientX - rect.left;
    const relativeX = (clickX / rect.width) * width;
    const plotRelativeX = relativeX - margin.left;
    const rawProgress = plotRelativeX / plotWidth;
    const nextProgress = Math.max(0, Math.min(1, rawProgress));
    onSeek(nextProgress);
  };

  return (
    <div className="temperature-chart-container" role="region" aria-label={ariaLabel}>
      <div className="chart-header">
        <div className="chart-title-wrap">
          <h2 className="chart-title">Global Mean Temperature Anomaly (1880–2025)</h2>
          <p className="chart-subtitle">
            Land-ocean temperature index relative to 1951–1980 baseline (°C)
          </p>
        </div>
        <div className="chart-live-badge" aria-hidden="true">
          <span className="badge-marker" />
          <span>Active Timeline</span>
        </div>
      </div>

      <div className="chart-svg-wrapper">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="temperature-svg"
          onClick={handleSeekFromEvent}
          aria-hidden="true"
        >
          <defs>
            {/* Anomaly line gradient: cool blue at bottom, neutral at baseline, warm red at top */}
            <linearGradient id="anomalyGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#4A90D9" />
              <stop offset="28%" stopColor="#60A5FA" />
              <stop offset="35%" stopColor="#CBD5E1" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#E85D4E" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>

            {/* Area under curve gradient */}
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E85D4E" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#4A90D9" stopOpacity="0.05" />
            </linearGradient>

            {/* Cursor glow */}
            <filter id="cursorGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Plot Background Area */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            className="chart-plot-bg"
          />

          {/* Y-Axis Horizontal Grid Lines */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            const isZero = tick === 0;
            return (
              <g key={`y-${tick}`} className={`grid-line-group ${isZero ? 'baseline-group' : ''}`}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  className={isZero ? 'grid-baseline' : 'grid-line'}
                />
                <text
                  x={margin.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className={`grid-label ${isZero ? 'baseline-label' : ''}`}
                >
                  {tick > 0 ? `+${tick.toFixed(1)}` : tick.toFixed(1)}°C
                </text>
              </g>
            );
          })}

          {/* Baseline Anomaly Legend Label */}
          <text
            x={width - margin.right}
            y={baselineY - 8}
            textAnchor="end"
            className="baseline-legend-text"
          >
            1951–1980 Baseline (0.0°C)
          </text>

          {/* X-Axis Vertical Guide Lines & Labels */}
          {xTicks.map((yr) => {
            const x = getX(yr);
            return (
              <g key={`x-${yr}`} className="x-axis-group">
                <line
                  x1={x}
                  y1={margin.top}
                  x2={x}
                  y2={height - margin.bottom}
                  className="x-grid-line"
                />
                <text
                  x={x}
                  y={height - margin.bottom + 22}
                  textAnchor="middle"
                  className="x-label"
                >
                  {yr}
                </text>
              </g>
            );
          })}

          {/* Temperature Area Fill */}
          <path d={areaPathWarm} fill="url(#areaGradient)" className="chart-area" />

          {/* Temperature Anomaly Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#anomalyGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="chart-line"
          />

          {/* Data Points (Sampled decadal markers) */}
          {data
            .filter((d) => d.year % 10 === 0 || d.year === 2025)
            .map((d) => (
              <circle
                key={`dot-${d.year}`}
                cx={getX(d.year)}
                cy={getY(d.anomalyC)}
                r="3"
                className="chart-data-dot"
              />
            ))}

          {/* Playback Cursor Line */}
          <line
            x1={cursorX}
            y1={margin.top}
            x2={cursorX}
            y2={height - margin.bottom}
            className="playback-cursor-line"
          />

          {/* Playback Cursor Indicator Dot */}
          <circle
            cx={cursorX}
            cy={cursorY}
            r="7"
            className="playback-cursor-dot"
            filter="url(#cursorGlow)"
          />
          <circle cx={cursorX} cy={cursorY} r="3" className="playback-cursor-dot-inner" />

          {/* Cursor Floating Badge inside SVG */}
          <g
            transform={`translate(${Math.min(
              width - margin.right - 90,
              Math.max(margin.left + 5, cursorX - 45)
            )}, ${Math.max(margin.top + 10, cursorY - 38)})`}
            className="cursor-svg-badge"
          >
            <rect
              x="0"
              y="0"
              width="90"
              height="26"
              rx="6"
              className="cursor-badge-bg"
            />
            <text x="45" y="17" textAnchor="middle" className="cursor-badge-text">
              {currentPoint.year}: {currentPoint.anomalyC > 0 ? '+' : ''}
              {currentPoint.anomalyC.toFixed(2)}°C
            </text>
          </g>
        </svg>
      </div>

      <div className="chart-footer-caption">
        <span>Click or tap anywhere along the timeline to scrub to a specific year.</span>
        <span>
          Current point: <strong>{currentPoint.year}</strong> (
          <span style={{ color: currentPoint.anomalyC >= 0 ? 'var(--data-warm)' : 'var(--data-cool)' }}>
            {currentPoint.anomalyC > 0 ? '+' : ''}
            {currentPoint.anomalyC.toFixed(2)}°C
          </span>
          )
        </span>
      </div>
    </div>
  );
};
