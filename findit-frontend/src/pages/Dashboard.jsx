import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const statusLabel = {
  open: "Open",
  pending: "Claim pending",
  resolved: "Resolved",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  // One request gets all the numbers, the recent reports and the pending claims
  useEffect(() => {
    api("/stats")
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="wrap">
        <h1>Dashboard</h1>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="wrap">
        <h1>Dashboard</h1>
        <p className="hint">Loading...</p>
      </div>
    );
  }

  const bars = [
    { key: "open", label: "Open", count: stats.open },
    { key: "pending", label: "Claim pending", count: stats.pending },
    { key: "resolved", label: "Resolved", count: stats.resolved },
  ];

  return (
    <div className="wrap">
      <h1>Dashboard</h1>
      <p className="sub">Overview of reports and claims.</p>

      {/* Four number cards */}
      <div className="stats">
        <div className="card stat">
          <b>{stats.total}</b>
          <span>Total reports</span>
        </div>
        <div className="card stat">
          <b>{stats.open}</b>
          <span>Open</span>
        </div>
        <div className="card stat">
          <b>{stats.pendingClaimsCount}</b>
          <span>Claims pending</span>
        </div>
        <div className="card stat">
          <b>{stats.resolved}</b>
          <span>Resolved</span>
        </div>
      </div>

      <div className="dash-cols">
        {/* Left: status bars and recent reports */}
        <div>
          <div className="card">
            <h2 className="small-title first">Reports by status</h2>
            {bars.map((b) => (
              <div key={b.key} className="bar-row">
                <div className="row bar-text">
                  <span>{b.label}</span>
                  <b>{b.count}</b>
                </div>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${b.key}`}
                    style={{
                      width: `${stats.total ? (b.count / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="card gap-top">
            <div className="row">
              <h2 className="small-title first">Recent reports</h2>
              <Link to="/admin/listings" className="link">View all</Link>
            </div>
            <div className="scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty">No reports yet.</td>
                    </tr>
                  ) : (
                    stats.recent.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>
                          <span className={`tag ${item.type}`}>
                            {item.type === "lost" ? "Lost" : "Found"}
                          </span>
                        </td>
                        <td>
                          <span className={`tag ${item.status}`}>
                            {statusLabel[item.status]}
                          </span>
                        </td>
                        <td>{item.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: pending claims */}
        <div className="card">
          <h2 className="small-title first">Pending claims</h2>
          {stats.pendingClaims.length === 0 ? (
            <p className="hint">No claims waiting for review.</p>
          ) : (
            stats.pendingClaims.map((c) => (
              <div key={c.id} className="item">
                <div>
                  <p className="item-name">{c.itemName}</p>
                  <p className="meta">Claimed by {c.claimant} · {c.submitted}</p>
                </div>
                <Link to="/admin/claims" className="btn alt sm">View</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}