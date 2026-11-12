import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const steps = [
  { key: "open", label: "Open" },
  { key: "pending", label: "Claim pending" },
  { key: "resolved", label: "Resolved" },
];

export default function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [busy, setBusy] = useState(false);

  // Load this item from the server whenever the address changes
  useEffect(() => {
    setLoading(true);
    setLoadError("");
    setSubmitted(false);
    setAnswer("");
    setClaimError("");

    api(`/items/${id}`)
      .then(setItem)
      .catch((err) => {
        setItem(null);
        // 404 means "not found", anything else is a real problem
        setLoadError(err.status === 404 ? "" : err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleClaim(e) {
    e.preventDefault();
    setBusy(true);
    setClaimError("");

    try {
      await api("/claims", { method: "POST", body: { itemId: item.id, answer } });
      setSubmitted(true);
      setItem({ ...item, status: "pending" });
    } catch (err) {
      setClaimError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="wrap">
        <p className="hint">Loading...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="wrap">
        <Link to="/" className="back">← Back to home</Link>
        <p className="error">{loadError}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="wrap">
        <Link to="/" className="back">← Back to home</Link>
        <h1>Item not found</h1>
        <p className="sub">This report does not exist or was removed.</p>
      </div>
    );
  }

  return (
    <div className="wrap">
      <Link to="/" className="back">← Back to home</Link>

      <div className="cols">
        {/* LEFT: item information */}
        <div className="card">
          <div className="row tags">
            <span className={`tag ${item.type}`}>
              {item.type === "lost" ? "Lost" : "Found"}
            </span>
          </div>
          <h1 className="item-title">{item.name}</h1>

          <dl className="facts">
            <div>
              <dt>Category</dt>
              <dd>{item.category}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{item.location}</dd>
            </div>
            <div>
              <dt>{item.type === "lost" ? "Date lost" : "Date found"}</dt>
              <dd>{item.date}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>Private</dd>
            </div>
          </dl>

          <h2 className="small-title">Description</h2>
          <p className="desc">{item.description}</p>
          <p className="hint">Sensitive details are not shown publicly.</p>

          <h2 className="small-title">Status</h2>
          <ul className="track">
            {steps.map((s) => (
              <li key={s.key} className={item.status === s.key ? "now" : ""}>
                {s.label}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT: claim box */}
        <div className="card">
          <h2 className="small-title first">Claim this item</h2>

          {submitted && (
            <p className="success">
              Claim submitted. You can follow its status in My claims.
            </p>
          )}

          {!submitted && item.status === "resolved" && (
            <p className="hint">This item has been returned to its owner.</p>
          )}

          {!submitted && item.status === "pending" && (
            <p className="hint">A claim is already being reviewed for this item.</p>
          )}

          {!submitted && item.status === "open" && !user && (
            <p className="hint">
              Please <Link to="/login" className="link">log in</Link> to claim this item.
            </p>
          )}

          {!submitted && item.status === "open" && user && (
            <form onSubmit={handleClaim}>
              <p className="hint spaced">
                Describe details only the owner would know. The poster or an
                administrator will review your claim.
              </p>
              <label htmlFor="claim">Your claim</label>
              <textarea
                id="claim"
                rows="5"
                maxLength={1000}
                placeholder="e.g. What is inside, any marks, when and where you lost it"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setClaimError("");
                }}
                required
              />
              <p className="hint spaced">
                Your answer is visible only to the poster and administrators. If
                approved, the finder's contact number appears here so you can
                arrange the handover.
              </p>
              {claimError && <p className="error">{claimError}</p>}
              <button type="submit" className="btn" disabled={busy}>
                {busy ? "Submitting..." : "Submit claim"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}