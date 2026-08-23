import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getSavedPosts } from "../services/post.api.js";
import { useToast } from "../../../components/Toast/ToastContext.jsx";
import "./SavedPosts.scss";

function SavedPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        getSavedPosts()
            .then((data) => setPosts(data.posts || []))
            .catch(() => {
                toast.error("Failed to load saved posts. Please refresh.");
                setPosts([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="saved-loading">
                <div className="feed-spinner"></div>
            </div>
        );
    }

    return (
        <div className="saved-page">
            <div className="saved-header">
                <h2 className="saved-title">🔖 Saved Posts</h2>
                <p className="saved-count">{posts.length} post{posts.length !== 1 ? "s" : ""} saved</p>
            </div>

            {posts.length === 0 ? (
                <div className="saved-empty">
                    <div className="saved-empty-icon">🔖</div>
                    <h3>Save posts</h3>
                    <p>Tap the bookmark icon on any post to save it here.</p>
                </div>
            ) : (
                <div className="saved-grid">
                    {posts.map((post) => (
                        <Link to={`/post/${post._id}`} className="saved-grid-item" key={post._id}>
                            <img src={post.Image_url} alt={post.caption || "Saved post"} />
                            <div className="saved-grid-overlay">
                                <div className="saved-overlay-user">
                                    <img
                                        src={post.user?.profileImage || "https://ik.imagekit.io/rufox9dki/avatar-default-user-profile-icon-simple-flat-grey-vector-57234191.webp"}
                                        alt={post.user?.username}
                                        className="saved-overlay-avatar"
                                    />
                                    <span>{post.user?.username}</span>
                                </div>
                                {post.caption && (
                                    <p className="saved-overlay-caption">{post.caption}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SavedPosts;
