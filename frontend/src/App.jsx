import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import "./App.css";

const CHART_COLORS = ["#818cf8", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#22d3ee"];

/* ─── Reusable Components ─── */
const StatusBadge = ({ status }) => {
  const map = {
    "On track": "badge-green",
    "Completed": "badge-green",
    "In Progress": "badge-blue",
    "Delayed": "badge-red",
    "High": "badge-red",
    "Medium": "badge-yellow",
    "Low": "badge-green",
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status}</span>;
};

const ProgressBar = ({ value }) => (
  <div className="progress-track">
    <div
      className="progress-fill"
      style={{ width: `${value}%` }}
    />
    <span className="progress-label">{value}%</span>
  </div>
);

const Card = ({ title, icon, badge, children, className = "" }) => (
  <section className={`card ${className}`}>
    <div className="card-header">
      <h2><span className="card-icon">{icon}</span>{title}</h2>
      {badge && <span className="counter-badge">{badge}</span>}
    </div>
    {children}
  </section>
);

const formatCurrency = (v) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
};

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => { setData(json); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading Board Deck…</p>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <h2>⚠️ Connection Error</h2>
      <p>{error}</p>
      <p className="hint">Make sure the backend server is running on port 3000.</p>
    </div>
  );

  const {
    strategy, bankStrategy, meetingAgenda,
    portfolio, metrics, roadmap, review
  } = data || {};

  /* Chart data */
  const portfolioChart = (portfolio || []).map(p => ({
    name: p.name,
    budget: p.budget,
    actual: p.actual_cost,
  }));

  const channelPie = (metrics || []).map(m => ({
    name: m.name.charAt(0).toUpperCase() + m.name.slice(1),
    value: m.volume,
  }));

  const totalVolume = (metrics || []).reduce((s, m) => s + m.volume, 0);

  return (
    <div className="dashboard">

      {/* ── Header ── */}
      <header className="dash-header">
        <div className="header-left">
          <h1>Board Deck AI</h1>
          <p className="subtitle">
            {bankStrategy?.bank_strategy || strategy?.name || "Executive Dashboard"}
          </p>
        </div>
        <div className="header-right">
          <div className="header-date">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          {strategy && <StatusBadge status={strategy.status} />}
        </div>
      </header>

      {/* ── Strategic Objectives ── */}
      {bankStrategy?.objectives && (
        <div className="objectives-bar">
          {bankStrategy.objectives.map((obj, i) => (
            <div key={i} className="objective-chip">
              <span className="obj-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              {obj}
            </div>
          ))}
        </div>
      )}

      {/* ── Meeting Agenda ── */}
      {meetingAgenda && (
        <Card title={meetingAgenda.title} icon="📋" className="agenda-card">
          <div className="agenda-table-wrap">
            <table className="agenda-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Topic</th>
                  <th>Presenter</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {meetingAgenda.items.map((item, i) => (
                  <tr key={i}>
                    <td className="time-cell">{item.time}</td>
                    <td>{item.topic}</td>
                    <td className="presenter-cell">{item.presenter}</td>
                    <td className="duration-cell">{item.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Project Portfolio ── */}
      {portfolio && portfolio.length > 0 && (
        <Card title="2025 Project Portfolio" icon="📁" badge={`${portfolio.length} projects`}>
          <div className="portfolio-grid">
            {portfolio.map((p, i) => {
              const overBudget = p.actual_cost > p.budget;
              return (
                <div key={i} className="portfolio-item">
                  <div className="portfolio-top">
                    <span className="portfolio-name">{p.name}</span>
                    <StatusBadge status={p.status} />
                  </div>

                  <ProgressBar value={p.progress} />

                  <div className="portfolio-meta">
                    <div className="meta-row">
                      <span className="label">Timeline</span>
                      <span className="meta-value">{p.start_date} → {p.end_date}</span>
                    </div>
                    <div className="meta-row">
                      <span className="label">Budget</span>
                      <span className="meta-value">{formatCurrency(p.budget)}</span>
                    </div>
                    <div className="meta-row">
                      <span className="label">Actual Cost</span>
                      <span className={`meta-value ${overBudget ? "over" : ""}`}>
                        {formatCurrency(p.actual_cost)}
                      </span>
                    </div>
                  </div>

                  {p.impact && (
                    <div className="impact-box">
                      <span className="impact-icon">⚡</span>
                      {p.impact}
                    </div>
                  )}

                  {p.alignment && (
                    <div className="alignment-tags">
                      {p.alignment.map((a, j) => (
                        <span key={j} className="align-tag">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Budget vs Actual chart */}
          {portfolioChart.length > 0 && (
            <div className="chart-section">
              <h3>Budget vs Actual Cost</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={portfolioChart} barGap={4}>
                    <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} tickFormatter={formatCurrency} />
                    <Tooltip
                      formatter={(v) => formatCurrency(v)}
                      contentStyle={{ background: "#1f2028", border: "1px solid #2e303a", borderRadius: 8, color: "#f3f4f6" }}
                    />
                    <Bar dataKey="budget" name="Budget" fill="#818cf8" radius={[6,6,0,0]} />
                    <Bar dataKey="actual" name="Actual" fill="#22d3ee" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── Two-column: Metrics + Roadmap ── */}
      <div className="two-col">

        {/* Business Metrics */}
        {metrics && metrics.length > 0 && (
          <Card title="Business Metrics" icon="📊" className="metrics-card">
            {/* KPI Cards */}
            <div className="kpi-row">
              <div className="kpi-card">
                <span className="kpi-value">{(totalVolume / 1_000_000).toFixed(1)}M</span>
                <span className="kpi-label">Total Transactions</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">
                  {(metrics.reduce((s, m) => s + m.success_rate, 0) / metrics.length * 100).toFixed(1)}%
                </span>
                <span className="kpi-label">Avg Success Rate</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">
                  {(metrics.reduce((s, m) => s + m.time_per_tx, 0) / metrics.length).toFixed(1)}m
                </span>
                <span className="kpi-label">Avg Time / Tx</span>
              </div>
            </div>

            {/* Channel breakdown */}
            <div className="metrics-detail">
              <div className="pie-wrap">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={channelPie} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={80} innerRadius={45}
                      paddingAngle={3} strokeWidth={0}
                    >
                      {channelPie.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${(v / 1000).toFixed(0)}K`}
                      contentStyle={{ background: "#1f2028", border: "1px solid #2e303a", borderRadius: 8, color: "#f3f4f6" }}
                    />
                    <Legend
                      iconSize={10} iconType="circle"
                      wrapperStyle={{ fontSize: 12, color: "#9ca3af" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="channel-list">
                {metrics.map((ch, i) => (
                  <div key={i} className="channel-row">
                    <span className="ch-dot" style={{ background: CHART_COLORS[i] }} />
                    <span className="ch-name">{ch.name.charAt(0).toUpperCase() + ch.name.slice(1)}</span>
                    <span className="ch-vol">{(ch.volume / 1_000_000).toFixed(1)}M txns</span>
                    <span className="ch-rate">{(ch.success_rate * 100).toFixed(0)}%</span>
                    <span className="ch-time">{ch.time_per_tx}m/tx</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* 2026 Roadmap */}
        {roadmap && roadmap.length > 0 && (
          <Card title="2026 Roadmap" icon="🗺️" badge={`${roadmap.length} initiatives`} className="roadmap-card">
            <div className="roadmap-list">
              {roadmap.map((item, i) => (
                <div key={i} className="roadmap-item">
                  <div className="roadmap-top">
                    <span className="roadmap-name">{item.name}</span>
                    <StatusBadge status={item.priority} />
                  </div>
                  <div className="meta-row">
                    <span className="label">Timeline</span>
                    <span className="meta-value">{item.start_date} → {item.end_date}</span>
                  </div>
                  <div className="meta-row">
                    <span className="label">Investment</span>
                    <span className="meta-value">{formatCurrency(item.budget)}</span>
                  </div>
                  {item.expected_impact && (
                    <div className="impact-box">
                      <span className="impact-icon">🎯</span>
                      {item.expected_impact}
                    </div>
                  )}
                  {item.alignment && (
                    <div className="alignment-tags">
                      {item.alignment.map((a, j) => (
                        <span key={j} className="align-tag">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ── QA Review ── */}
      {review && review.length > 0 && (
        <Card title="QA Review" icon="✅">
          <div className="review-list">
            {review.map((r, i) => (
              <div key={i} className="review-item">
                <span>{r.slide}</span>
                <span className={`review-status ${r.review === "QA passed" ? "passed" : "failed"}`}>
                  {r.review}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <footer className="dash-footer">
        Board Deck AI · Generated {new Date().toLocaleDateString()}
      </footer>
    </div>
  );
}