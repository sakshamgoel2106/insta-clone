import { useState, useEffect } from "react";
import { Link } from "react-router";
import { searchUsers } from "../../auth/services/auth.api.js";
import { useToast } from "../../../components/Toast/ToastContext.jsx";
import "./Search.scss";

function Search() {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (!query.trim()) {
            setUsers([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await searchUsers(query.trim());
                setUsers(data.users || []);
            } catch {
                toast.error("Failed to search users");
            } finally {
                setLoading(false);
            }
        }, 500); // Debounce

        return () => clearTimeout(timer);
    }, [query, toast]);

    return (
        <div className="search-page">
            <div className="search-header">
                <h2>Search</h2>
                <div className="search-input-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="search-input"
                        autoFocus
                    />
                </div>
            </div>

            <div className="search-results">
                {loading ? (
                    <div className="search-loading">
                        <div className="feed-spinner"></div>
                    </div>
                ) : users.length === 0 && query.trim() ? (
                    <div className="search-empty">No results found for "{query}"</div>
                ) : (
                    users.map((user) => (
                        <Link to={`/${user.username}`} className="search-result-item" key={user._id}>
                            <img
                                src={user.profileImage || "https://ik.imagekit.io/rufox9dki/avatar-default-user-profile-icon-simple-flat-grey-vector-57234191.webp"}
                                alt={user.username}
                                className="search-avatar"
                            />
                            <div className="search-user-info">
                                <span className="search-username">{user.username}</span>
                                {user.bio && <span className="search-bio">{user.bio}</span>}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

export default Search;
