import { Link } from "react-router-dom";
import { imageUrl } from "../api";

const statusLabel = {
  open: "Open",
  pending: "Claim pending",
  resolved: "Resolved",
};

export default function ItemCard({ item }) {
  return (
    <div className="card">
      {item.image && (
        <img
          src={imageUrl(item.image)}
          alt={item.name}
          className="thumb"
          loading="lazy"
        />
      )}
      <div className="row">
        <span className={`tag ${item.type}`}>
          {item.type === "lost" ? "Lost" : "Found"}
        </span>
        <span className={`tag ${item.status}`}>{statusLabel[item.status]}</span>
      </div>
      <h3>{item.name}</h3>
      <p className="meta">
        {item.category} · {item.location} · {item.date}
      </p>
      <p className="desc">{item.description}</p>
      <Link to={`/items/${item.id}`} className="btn alt sm">View details</Link>
    </div>
  );
}