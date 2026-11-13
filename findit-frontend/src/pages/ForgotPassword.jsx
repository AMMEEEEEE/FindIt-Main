import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await api("/auth/forgot-password", { method: "POST", body: { email } });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
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
            It is valid for 30 minutes.
          </p>
          <p className="switch">
            <Link to="/login" className="link">Back to log in</Link>
          </p>
        </>
      ) : (
        <>
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@college.edu"
                className={error ? "invalid" : ""}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
              {error && <p className="field-error">{error}</p>}
            </div>
            <button type="submit" className="btn" disabled={busy}>
              {busy ? "Sending..." : "Send reset link"}
            </button>
          </form>
          <p className="switch">
            Remembered it? <Link to="/login" className="link">Log in</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}