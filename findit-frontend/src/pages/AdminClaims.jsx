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

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    api("/claims")
      .then(setClaims)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const shown =
    filter === "all" ? claims : claims.filter((c) => c.status === filter);

  async function review(claim, newStatus) {
    if (
      newStatus === "approved" &&
      !window.confirm(
        `Approve this claim by ${claim.claimant}? They will see the finder's contact number.`
      )
    ) {
      return;
    }

    setBusyId(claim.id);
    setError("");
    try {
      await api(`/claims/${claim.id}`, { method: "PATCH", body: { status: newStatus } });
      // Update this row on screen. The server has already updated the item too.
      setClaims(claims.map((c) => (c.id === claim.id ? { ...c, status: newStatus } : c)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
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

      {error && <p className="error">{error}</p>}

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
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty">Loading...</td>
                </tr>
              ) : shown.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty">No claims in this category.</td>
                </tr>
              ) : (
                shown.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/items/${c.itemId}`} className="link">
                        {c.itemName}
                      </Link>
                    </td>
                    <td>
                      {c.claimant}
                      <p className="meta">{c.claimantRegNo}</p>
                    </td>
                    <td className="claim-cell">{c.answer}</td>
                    <td>
                      <span className={`tag ${c.status}`}>{statusLabel[c.status]}</span>
                    </td>
                    <td>{c.submitted}</td>
                    <td>
                      {c.status === "pending" ? (
                        <div className="actions">
                          <button
                            className="btn sm"
                            disabled={busyId === c.id}
                            onClick={() => review(c, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="btn no sm"
                            disabled={busyId === c.id}
                            onClick={() => review(c, "rejected")}
                          >
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