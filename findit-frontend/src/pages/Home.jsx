import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ItemCard from "../components/ItemCard";

export default function Home() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ask the server for items whenever the search or the type changes.
  // The 300 ms wait means typing "wallet" sends one request, not six.
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (type) params.set("type", type);
      const query = params.toString();

      setLoading(true);
      api(`/items${query ? "?" + query : ""}`)
        .then((data) => {
          if (!cancelled) {
            setItems(data);
            setError("");
          }
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    // If the user types again before 300 ms pass, throw the old request away
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, type]);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Lost and Found Management System</p>
        <h1>Lost something? <span>FindIt.</span></h1>
        <p className="lead">
          Search reports of lost and found items across your institution, or
          report one in under a minute.
        </p>
        <div className="sbar">
          <input
            type="text"
            placeholder="Search items, places..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Lost and found</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </div>
      </section>

      <section className="sec">
        <div className="row sec-head">
          <h2>Recent reports</h2>
          <Link to="/report" className="btn">Report an item</Link>
        </div>

        {error ? (
          <p className="error">{error}</p>
        ) : loading && items.length === 0 ? (
          <p className="sub">Loading...</p>
        ) : items.length === 0 ? (
          <p className="sub">No reports match your search.</p>
        ) : (
          <div className="grid3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}