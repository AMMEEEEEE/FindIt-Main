import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function AdminListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    api("/items")
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const shown = items.filter((item) => {
    const text = `${item.name} ${item.category} ${item.location}`.toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (type === "" || item.type === type) &&
      (status === "" || item.status === status)
    );
  });

  async function changeStatus(id, newStatus) {
    setBusyId(id);
    setError("");
    try {
      await api(`/items/${id}/status`, { method: "PATCH", body: { status: newStatus } });
      setItems(items.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteItem(item) {
    if (
      !window.confirm(
        `Delete "${item.name}"? Its claims will be deleted too. This cannot be undone.`
      )
    ) {
      return;
    }

    setBusyId(item.id);
    setError("");
    try {
      await api(`/items/${item.id}`, { method: "DELETE" });
      setItems(items.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="wrap">
      <h1>Listings</h1>
      <p className="sub">Manage all lost and found reports.</p>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name, category or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="pending">Claim pending</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card">
        <div className="scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
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
                  <td colSpan="6" className="empty">No listings match your filters.</td>
                </tr>
              ) : (
                shown.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <b>{item.name}</b>
                      <p className="meta">{item.category}</p>
                    </td>
                    <td>
                      <span className={`tag ${item.type}`}>
                        {item.type === "lost" ? "Lost" : "Found"}
                      </span>
                    </td>
                    <td>{item.location}</td>
                    <td>{item.date}</td>
                    <td>
                      <select
                        className="status-select"
                        value={item.status}
                        disabled={busyId === item.id}
                        onChange={(e) => changeStatus(item.id, e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="pending">Claim pending</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <div className="actions">
                        <Link to={`/items/${item.id}`} className="btn alt sm">View</Link>
                        <button
                          className="btn no sm"
                          disabled={busyId === item.id}
                          onClick={() => deleteItem(item)}
                        >
                          Delete
                        </button>
                      </div>
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