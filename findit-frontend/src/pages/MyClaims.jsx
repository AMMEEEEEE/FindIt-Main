import { useState } from "react";
import { Link } from "react-router-dom";
import { items } from "../data/items";
import { claims } from "../data/claims";

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

  // Attach the matching item to each claim
  const myClaims = claims.map((c) => ({
    ...c,
    item: items.find((i) => i.id === c.itemId),
  }));

  const shown =
    filter === "all" ? myClaims : myClaims.filter((c) => c.status === filter);

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
        {shown.length === 0 ? (
          <p className="hint">No claims in this category.</p>
        ) : (
          shown.map((claim) => (
            <div key={claim.id} className="item">
              <div className="claim-info">
                <p className="item-name">{claim.item.name}</p>
                <p className="meta">
                  {claim.item.category} · {claim.item.location} · Claimed on {claim.submitted}
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
                <Link to={`/items/${claim.item.id}`} className="btn alt sm">View item</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}