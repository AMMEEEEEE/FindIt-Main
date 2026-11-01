import { useState } from "react";
import { Link } from "react-router-dom";
import { items } from "../data/items";
import ItemCard from "../components/ItemCard";

export default function Home() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  const filtered = items.filter((item) => {
    const text = `${item.name} ${item.category} ${item.location} ${item.description}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesType = type === "" || item.type === type;
    return matchesSearch && matchesType;
  });

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

        {filtered.length === 0 ? (
          <p className="sub">No reports match your search.</p>
        ) : (
          <div className="grid3">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}