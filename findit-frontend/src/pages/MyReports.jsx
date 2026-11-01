import { useState } from "react";
import { Link } from "react-router-dom";
import { items } from "../data/items";

const filters = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "pending", label: "Claim pending" },
  { key: "resolved", label: "Resolved" },
];

const statusLabel = {
  open: "Open",
  pending: "Claim pending",
  resolved: "Resolved",
};

export default function MyReports() {
  const [filter, setFilter] = useState("all");

  // Fake "my reports" for now: we pretend items 1, 3 and 5 are mine.
  // With the backend, this will be the reports of the logged-in user.
  const myReports = items.filter((i) => [1, 3, 5].includes(i.id));

  const shown =
    filter === "all" ? myReports : myReports.filter((i) => i.status === filter);

  return (
    <div className="wrap">
      <div className="row page-head">
        <div>
          <h1>My reports</h1>
          <p className="sub">Items you have reported as lost or found.</p>
        </div>
        <Link to="/report" className="btn">Report an item</Link>
      </div>

      <div className="chips">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`chip ${filter === f.key ? "on" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card">
        {shown.length === 0 ? (
          <p className="hint">No reports in this category.</p>
        ) : (
          shown.map((item) => (
            <div key={item.id} className="item">
              <div>
                <p className="item-name">{item.name}</p>
                <p className="meta">
                  {item.category} · {item.location} · {item.date}
                </p>
              </div>
              <div className="item-right">
                <span className={`tag ${item.type}`}>
                  {item.type === "lost" ? "Lost" : "Found"}
                </span>
                <span className={`tag ${item.status}`}>
                  {statusLabel[item.status]}
                </span>
                <Link to={`/items/${item.id}`} className="btn alt sm">View</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}