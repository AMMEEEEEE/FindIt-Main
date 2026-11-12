import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

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

export default function MyClaims() {
  const [filter, setFilter] = useState("all");
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/claims/mine")
      .then(setClaims)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const shown =
    filter === "all" ? claims : claims.filter((c) => c.status === filter);

  return (
    <div className="wrap">
      <div className="row page-head">
        <div>
          <h1>My claims</h1>
          <p className="sub">Ownership claims you have submitted.</p>
        </div>
        <Link to="/" className="btn alt">Browse items</Link>
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
        {loading ? (
          <p className="hint">Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : shown.length === 0 ? (
          <p className="hint">No claims in this category.</p>
        ) : (
          shown.map((claim) => (
            <div key={claim.id} className="item">
              <div className="claim-info">
                <p className="item-name">{claim.itemName}</p>
                <p className="meta">
                  {claim.category} · {claim.location} · Claimed on {claim.submitted}
                </p>
                <p className="claim-text">Your answer: {claim.answer}</p>

                {claim.status === "approved" && (
                  <p className="contact-box">
                    Claim approved. Finder's contact: <b>{claim.contact}</b>
                  </p>
                )}
                {claim.status === "rejected" && (
                  <p className="hint">
                    This claim was not accepted. You can contact an administrator if you think this is a mistake.
                  </p>
                )}
              </div>

              <div className="item-right">
                <span className={`tag ${claim.status}`}>
                  {statusLabel[claim.status]}
                </span>
                <Link to={`/items/${claim.itemId}`} className="btn alt sm">View item</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}