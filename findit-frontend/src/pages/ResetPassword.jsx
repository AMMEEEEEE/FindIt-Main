import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { api } from "../api";

export default function ResetPassword() {
  // The secret token from the link: /reset-password/<token>
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  function validate() {
    const found = {};
    if (!password) {
      found.password = "Please enter a new password.";
    } else if (password.length < 6) {
      found.password = "Password must be at least 6 characters.";
    }
    if (!confirm) {
      found.confirm = "Please confirm your new password.";
    } else if (password !== confirm) {
      found.confirm = "Passwords do not match.";
    }
    return found;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await api("/auth/reset-password", { method: "POST", body: { token, password } });
      setDone(true);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="Your password has been changed.">
        <p className="success">You can now log in with your new password.</p>
        <p className="switch">
          <Link to="/login" className="link">Go to log in</Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a password you have not used before.">
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="password">New password</label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            className={errors.password ? "invalid" : ""}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: "", form: "" });
            }}
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div className="field">
          <label htmlFor="confirm">Confirm new password</label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            className={errors.confirm ? "invalid" : ""}
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setErrors({ ...errors, confirm: "", form: "" });
            }}
          />
          {errors.confirm && <p className="field-error">{errors.confirm}</p>}
        </div>

        {errors.form && (
          <p className="error">
            {errors.form}{" "}
            <Link to="/forgot-password" className="link">Request a new link</Link>
          </p>
        )}
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Saving..." : "Save new password"}
        </button>
      </form>
    </AuthLayout>
  );
}