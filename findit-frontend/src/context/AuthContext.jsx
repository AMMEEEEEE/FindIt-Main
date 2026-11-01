import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Demo accounts for testing. The backend will replace these.
const demoUsers = [
  { email: "user@college.edu", password: "user123", name: "Demo Student", role: "user" },
  { email: "admin@college.edu", password: "admin123", name: "Admin", role: "admin" },
];

export function AuthProvider({ children }) {
  // Read the saved login from the browser, so refreshing keeps you logged in
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("findit_user"));
    } catch {
      return null;
    }
  });

  function login(email, password) {
    const found = demoUsers.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!found) return null;

    const loggedIn = { email: found.email, name: found.name, role: found.role };
    setUser(loggedIn);
    localStorage.setItem("findit_user", JSON.stringify(loggedIn));
    return loggedIn;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("findit_user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}