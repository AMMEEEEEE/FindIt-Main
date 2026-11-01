import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  function validate() {
    const found = {};
    if (!email.trim()) {
      found.email = "Please enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      found.email = "Please enter a valid email address.";
    }
    if (!password) {
      found.password = "Please enter your password.";
    }
    return found;
  }

  function handleSubmit(e) {
    e.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const loggedIn = login(email, password);
    if (!loggedIn) {
      setErrors({ form: "Wrong email or password." });
      return;
    }
    navigate(loggedIn.role === "admin" ? "/admin" : "/");
  }

  return (
    <AuthLayout title="Log in" subtitle="Welcome back. Log in to report items and track your claims.">
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@college.edu"
            className={errors.email ? "invalid" : ""}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: "", form: "" });
            }}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="field">
          <div className="label-row">
            <label htmlFor="password">Password</label>
            <Link to="/forgot-password" className="forgot">Forgot password?</Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            className={errors.password ? "invalid" : ""}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: "", form: "" });
            }}
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        {errors.form && <p className="error">{errors.form}</p>}
        <button type="submit" className="btn">Log in</button>
      </form>

      <p className="switch">
        New to FindIt? <Link to="/register" className="link">Create an account</Link>
      </p>

      {/* Demo accounts. Delete this box before submitting the project. */}
      <div className="demo-box">
        <b>Demo accounts</b>
        <p>Student: user@college.edu / user123</p>
        <p>Admin: admin@college.edu / admin123</p>
      </div>
    </AuthLayout>
  );
}