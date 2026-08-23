import { useState } from "react";
import "../styles/form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../../../components/Toast/ToastContext.jsx";

function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const { handlelogin, loading } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    async function handlesubmit(e) {
        e.preventDefault();
        try {
            await handlelogin(identifier, password);
            toast.success("Welcome back! You're logged in.");
            navigate("/feed");
        } catch (err) {
            const msg = err?.response?.data?.message || "Login failed. Please check your credentials.";
            toast.error(msg);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-box">
                    <h1 className="auth-logo">Instaclone</h1>

                    <form onSubmit={handlesubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
                        <div className="auth-input-group">
                            <span className="auth-input-icon">👤</span>
                            <input
                                onChange={(e) => setIdentifier(e.target.value)}
                                type="text"
                                name="username"
                                placeholder="Username or email"
                                value={identifier}
                                required
                            />
                        </div>

                        <div className="auth-input-group">
                            <span className="auth-input-icon">🔒</span>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={password}
                                required
                            />
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>OR</span>
                    </div>
                </div>

                <div className="auth-link-box">
                    Don't have an account?
                    <Link className="auth-link" to="/register">Sign up</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
