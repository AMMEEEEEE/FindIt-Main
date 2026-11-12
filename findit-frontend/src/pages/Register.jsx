import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    regNo: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setServerError("");
  }

  function validate() {
    const found = {};
    if (!form.name.trim()) found.name = "Please enter your full name.";
    if (!form.regNo.trim()) found.regNo = "Please enter your register number.";

    if (!form.email.trim()) {
      found.email = "Please enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      found.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      found.password = "Please enter a password.";
    } else if (form.password.length < 6) {
      found.password = "Password must be at least 6 characters.";
    }

    if (!form.confirm) {
      found.confirm = "Please confirm your password.";
    } else if (form.password !== form.confirm) {
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
      // "confirm" is only for checking in the browser, so it is not sent
      await register({
        name: form.name,
        regNo: form.regNo,
        email: form.email,
        password: form.password,
      });
      navigate("/login");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="It takes less than a minute.">
      <form onSubmit={handleSubmit} noValidate>
        <div className="f2">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className={errors.name ? "invalid" : ""}
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
          <div className="field">
            <label htmlFor="regNo">Register number</label>
            <input
              id="regNo"
              name="regNo"
              type="text"
              autoComplete="off"
              className={errors.regNo ? "invalid" : ""}
              value={form.regNo}
              onChange={handleChange}
            />
            {errors.regNo && <p className="field-error">{errors.regNo}</p>}
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
            className={errors.email ? "invalid" : ""}
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="f2">
          <div className="field">
            <label htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              className={errors.password ? "invalid" : ""}
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              className={errors.confirm ? "invalid" : ""}
              value={form.confirm}
              onChange={handleChange}
            />
            {errors.confirm && <p className="field-error">{errors.confirm}</p>}
          </div>
        </div>

        {serverError && <p className="error">{serverError}</p>}
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="switch">
        Already have an account? <Link to="/login" className="link">Log in</Link>
      </p>
    </AuthLayout>
  );
}