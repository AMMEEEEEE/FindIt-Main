import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false); // false until we know if the saved login is still valid

  // On page load: if a token is saved, ask the server who it belongs to
  useEffect(() => {
    const token = localStorage.getItem("findit_token");
    if (!token) {
      setReady(true);
      return;
    }

    api("/auth/me")
      .then((data) => setUser(data.user))
      .catch((err) => {
        // Only forget the login if the server rejected the token.
        // If the server is just switched off, keep it.
        if (err.status === 401 || err.status === 404) {
          localStorage.removeItem("findit_token");
        }
      })
      .finally(() => setReady(true));
  }, []);

  async function login(email, password) {
    const data = await api("/auth/login", { method: "POST", body: { email, password } });
    localStorage.setItem("findit_token", data.token);
    setUser(data.user);
    return data.user;
  }

  function register(form) {
    return api("/auth/register", { method: "POST", body: form });
  }

  function logout() {
    localStorage.removeItem("findit_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}