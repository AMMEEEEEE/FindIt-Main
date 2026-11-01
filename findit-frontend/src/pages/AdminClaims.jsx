import { useState } from "react";
import { Link } from "react-router-dom";
import { items } from "../data/items";
import { allClaims } from "../data/allClaims";

const filters = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const statusLabel = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export default function AdminClaims() {
  // Copy the data into state so approve/reject shows on screen
  const [claims, setClaims] = useState(allClaims);
  const [filter, setFilter] = useState("all");

  const withItems = claims.map((c) => ({
    ...c,
    item: items.find((i) => i.id === c.itemId),
  }));

  const shown =
    filter === "all" ? withItems : withItems.filter((c) => c.status === filter);

  function review(id, newStatus) {
    setClaims(claims.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
  }

  return (
    <div className="wrap">
      <h1>Claims</h1>
      <p className="sub">View all ownership claims and their status.</p>

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
        <div className="scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Item</th>
                <th>Claimant</th>
                <th>Claim details</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty">No claims in this category.</td>
                </tr>
              ) : (
                shown.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/items/${c.item.id}`} className="link">
                        {c.item.name}
                      </Link>
                    </td>
                    <td>{c.claimant}</td>
                    <td className="claim-cell">{c.answer}</td>
                    <td>
                      <span className={`tag ${c.status}`}>{statusLabel[c.status]}</span>
                    </td>
                    <td>{c.submitted}</td>
                    <td>
                      {c.status === "pending" ? (
                        <div className="actions">
                          <button className="btn sm" onClick={() => review(c.id, "approved")}>
                            Approve
                          </button>
                          <button className="btn no sm" onClick={() => review(c.id, "rejected")}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="meta">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}