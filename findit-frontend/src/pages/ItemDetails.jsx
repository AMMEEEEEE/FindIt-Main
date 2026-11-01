import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { items } from "../data/items";
import { useAuth } from "../context/AuthContext";

const steps = [
  { key: "open", label: "Open" },
  { key: "pending", label: "Claim pending" },
  { key: "resolved", label: "Resolved" },
];

export default function ItemDetails() {
  const { user } = useAuth();
  const item = items.find((i) => i.id === Number(id));

  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!item) {
    return (
      <div className="wrap">
        <Link to="/" className="back">← Back to home</Link>
        <h1>Item not found</h1>
        <p className="sub">This report does not exist or was removed.</p>
      </div>
    );
  }

  function handleClaim(e) {
    e.preventDefault();
    // Fake claim for now. The real one will be sent to the backend.
    console.log("Claim submitted for item", item.id, ":", answer);
    setSubmitted(true);
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

          {item.status === "resolved" && (
            <p className="hint">This item has been returned to its owner.</p>
          )}

          {item.status === "pending" && (
            <p className="hint">A claim is already being reviewed for this item.</p>
          )}

          {item.status === "open" && !user && (
  <p className="hint">
    Please <Link to="/login" className="link">log in</Link> to claim this item.
  </p>
)}

{item.status === "open" && !submitted && user && (
            <form onSubmit={handleClaim}>
              <p className="hint spaced">
                Describe details only the owner would know. The poster or an
                administrator will review your claim.
              </p>
              <label htmlFor="claim">Your claim</label>
              <textarea
                id="claim"
                rows="5"
                placeholder="e.g. What is inside, any marks, when and where you lost it"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
              />
              <p className="hint spaced">
                Your answer is visible only to the poster and administrators. If
                approved, the finder's contact number appears here so you can
                arrange the handover.
              </p>
              <button type="submit" className="btn">Submit claim</button>
            </form>
          )}

          {item.status === "open" && submitted && (
            <p className="success">
              Claim submitted. You can follow its status in My claims.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}