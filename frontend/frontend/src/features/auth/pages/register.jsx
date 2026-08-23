import { useState } from "react";
import "../styles/form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../../../components/Toast/ToastContext.jsx";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { handleregister, loading } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    async function handlesubmit(e) {
        e.preventDefault();
        if (password.length < 6) {
            toast.warning("Password must be at least 6 characters.");
            return;
        }
        try {
            await handleregister(username, email, password);
            toast.success("Account created! Welcome to Instaclone 🎉");
            navigate("/feed");
        } catch (err) {
            const msg = err?.response?.data?.message || "Registration failed. Please try again.";
            toast.error(msg);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-box">
                    <h1 className="auth-logo">Instaclone</h1>
                    <p className="auth-tagline">Sign up to see photos and videos from your friends.</p>

                    <form onSubmit={handlesubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
                        <div className="auth-input-group">
                            <span className="auth-input-icon">📧</span>
                            <input
                                onInput={(e) => setEmail(e.target.value)}
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                            />
                        </div>

                        <div className="auth-input-group">
                            <span className="auth-input-icon">👤</span>
                            <input
                                onInput={(e) => setUsername(e.target.value)}
                                type="text"
                                name="username"
                                placeholder="Username"
                                required
                            />
                        </div>

                        <div className="auth-input-group">
                            <span className="auth-input-icon">🔒</span>
                            <input
                                onInput={(e) => setPassword(e.target.value)}
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                            />
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? "Creating account..." : "Sign up"}
                        </button>
                    </form>

                    <p style={{ fontSize: "0.72rem", color: "#8e8e8e", textAlign: "center", lineHeight: "1.5" }}>
                        By signing up, you agree to our <strong>Terms</strong>, <strong>Privacy Policy</strong> and <strong>Cookies Policy</strong>.
                    </p>
                </div>

                <div className="auth-link-box">
                    Have an account?
                    <Link className="auth-link" to="/login">Log in</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
