import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../features/auth/hooks/useAuth.js";
import { useToast } from "./Toast/ToastContext.jsx";
import "./Layout.scss";

function Layout({ children }) {
    const { user, handlelogout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const onLogout = async () => {
        try {
            await handlelogout();
            toast.success("You've been logged out. See you soon!");
        } catch {
            toast.error("Logout failed. Please try again.");
        } finally {
            navigate("/login");
        }
    };

    const navItems = [
        { to: "/feed",    icon: "🏠", label: "Home"    },
        { to: "/search",  icon: "🔍", label: "Search"  },
        { to: "/reels",   icon: "🎬", label: "Reels"   },
        { to: "/saved",   icon: "🔖", label: "Saved"   },
        { to: "/profile", icon: "👤", label: "Profile" },
    ];

    return (
        <div className="layout">
            {/* Sidebar — desktop */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <span className="sidebar-logo-text">Instaclone</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `sidebar-nav-item${isActive ? " active" : ""}`
                            }
                        >
                            <span className="sidebar-nav-icon">{item.icon}</span>
                            <span className="sidebar-nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {user && (
                        <NavLink to="/profile" className="sidebar-user" style={{ textDecoration: 'none' }}>
                            <img
                                src={user.profileImage || "https://ik.imagekit.io/rufox9dki/avatar-default-user-profile-icon-simple-flat-grey-vector-57234191.webp"}
                                alt={user.username}
                                className="sidebar-user-avatar"
                            />
                            <span className="sidebar-user-name">{user.username}</span>
                        </NavLink>
                    )}
                    <button className="sidebar-logout-btn" onClick={onLogout} id="logout-btn">
                        <span>🚪</span>
                        <span>Log out</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="layout-main">
                {children}
            </main>

            {/* Bottom nav — mobile */}
            <nav className="bottom-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `bottom-nav-item${isActive ? " active" : ""}`
                        }
                    >
                        <span className="bottom-nav-icon">{item.icon}</span>
                        <span className="bottom-nav-label">{item.label}</span>
                    </NavLink>
                ))}
                <button className="bottom-nav-item" onClick={onLogout} id="mobile-logout-btn">
                    <span className="bottom-nav-icon">🚪</span>
                    <span className="bottom-nav-label">Logout</span>
                </button>
            </nav>
        </div>
    );
}

export default Layout;
