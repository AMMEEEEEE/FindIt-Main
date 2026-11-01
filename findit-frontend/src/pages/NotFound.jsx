import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="wrap">
      <h1>Page not found</h1>
      <p className="sub">The page you are looking for does not exist.</p>
      <Link to="/" className="btn">Go to home</Link>
    </div>
  );
}