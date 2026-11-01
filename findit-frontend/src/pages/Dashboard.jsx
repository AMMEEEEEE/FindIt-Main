import { Link } from "react-router-dom";
import { items } from "../data/items";
import { allClaims as claims } from "../data/allClaims";

const statusLabel = {
  open: "Open",
  pending: "Claim pending",
  resolved: "Resolved",
};

export default function Dashboard() {
  // Numbers are calculated from the data, not typed by hand
  const total = items.length;
  const openCount = items.filter((i) => i.status === "open").length;
  const pendingCount = items.filter((i) => i.status === "pending").length;
  const resolvedCount = items.filter((i) => i.status === "resolved").length;

  const bars = [
    { key: "open", label: "Open", count: openCount },
    { key: "pending", label: "Claim pending", count: pendingCount },
    { key: "resolved", label: "Resolved", count: resolvedCount },
  ];

  const recent = items.slice(0, 4);

  const pendingClaims = claims
    .filter((c) => c.status === "pending")
    .map((c) => ({ ...c, item: items.find((i) => i.id === c.itemId) }));

  return (
    <div className="wrap">
      <h1>Dashboard</h1>
      <p className="sub">Overview of reports and claims.</p>

      {/* Four number cards */}
      <div className="stats">
        <div className="card stat">
          <b>{total}</b>
          <span>Total reports</span>
        </div>
        <div className="card stat">
          <b>{openCount}</b>
          <span>Open</span>
        </div>
        <div className="card stat">
          <b>{pendingClaims.length}</b>
          <span>Claims pending</span>
        </div>
        <div className="card stat">
          <b>{resolvedCount}</b>
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
                    style={{ width: `${total ? (b.count / total) * 100 : 0}%` }}
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
                  {recent.map((item) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: pending claims */}
        <div className="card">
          <h2 className="small-title first">Pending claims</h2>
          {pendingClaims.length === 0 ? (
            <p className="hint">No claims waiting for review.</p>
          ) : (
            pendingClaims.map((c) => (
              <div key={c.id} className="item">
                <div>
                  <p className="item-name">{c.item.name}</p>
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