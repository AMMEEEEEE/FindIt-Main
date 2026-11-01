import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // Fake for now. The backend will email a reset link here.
    console.log("Password reset requested for:", email);
    setSent(true);
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we will send you a link to reset your password."
    >
      {sent ? (
        <>
          <p className="success">
            If an account exists for <b>{email}</b>, a reset link has been sent.
            Check your inbox.
          </p>
          <p className="switch">
            <Link to="/login" className="link">Back to log in</Link>
          </p>
        </>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn">Send reset link</button>
          </form>
          <p className="switch">
            Remembered it? <Link to="/login" className="link">Log in</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}