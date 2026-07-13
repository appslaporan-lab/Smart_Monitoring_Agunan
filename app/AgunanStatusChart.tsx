'use client';

import { useState } from 'react';

type StatusSegment = {
  label: string;
  count: number;
  className: string;
  percent: number;
  segmentLength: number;
  offset: number;
};

type SummaryStat = {
  label: string;
  value: number;
  accent: string;
};

type JenisCount = {
  jenis: string;
  count: number;
  percent: number;
};

type Props = {
  totalCount: number;
  summaryStats: SummaryStat[];
  statusSegments: StatusSegment[];
  jenisCounts: JenisCount[];
};

export default function AgunanStatusChart({ totalCount, summaryStats, statusSegments, jenisCounts }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeLabel = activeIndex !== null ? statusSegments[activeIndex].label : null;

  return (
    <div>
      <div className="overview-metrics" style={{ marginTop: 24 }}>
        {summaryStats.map((stat) => (
          <div key={stat.label} className="metric-card">
            <div className={`metric-accent ${stat.accent}`} />
            <div>
              <div className="metric-value">{stat.value}</div>
              <div className="metric-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="donut-chart-panel" style={{ marginTop: 32 }}>
        <div className="donut-chart-wrapper">
          <svg viewBox="0 0 220 220" className="donut-chart" aria-label="Distribusi status agunan">
            <circle cx="110" cy="110" r="72" className="donut-ring" />
            {statusSegments.map((segment, index) => (
              <circle
                key={segment.label}
                cx="110"
                cy="110"
                r="72"
                className={`donut-segment ${segment.className}`}
                strokeDasharray={`${segment.segmentLength} ${2 * Math.PI * 72}`}
                strokeDashoffset={2 * Math.PI * 72 - segment.offset}
                style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.3 }}
              >
                <title>{`${segment.label}: ${segment.count} (${segment.percent}%)`}</title>
              </circle>
            ))}
          </svg>
          <div className="donut-center">
            <span>{activeLabel || 'Total'}</span>
            <strong>{activeLabel ? statusSegments[activeIndex!].count : totalCount}</strong>
          </div>
        </div>

        <div className="donut-legend">
          {statusSegments.map((segment, index) => (
            <button
              key={segment.label}
              type="button"
              className={`donut-legend-item ${activeIndex === index ? 'active' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span className={`donut-legend-swatch ${segment.className}`} />
              <div>
                <strong>{segment.label}</strong>
                <div>{segment.count} item • {segment.percent}%</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="jenis-chart-card" style={{ marginTop: 28 }}>
        <h3>Distribusi per Jenis Agunan</h3>
        <div className="jenis-chart-list">
          {jenisCounts.map((item) => (
            <div key={item.jenis} className="jenis-chart-item">
              <div className="jenis-chart-title">
                <strong>{item.jenis}</strong>
                <span>{item.count} item</span>
              </div>
              <div className="jenis-chart-bar-wrapper">
                <div className="jenis-chart-bar" style={{ width: `${item.percent}%` }} />
              </div>
              <div className="jenis-chart-percent">{item.percent}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
