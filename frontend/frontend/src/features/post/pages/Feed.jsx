import { useState, useEffect, useRef } from "react";
import { getAllPosts, getComments, addComment, toggleSave, getSavedPostIds } from "../services/post.api.js";
import { useToast } from "../../../components/Toast/ToastContext.jsx";
import "./Feed.scss";

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

// Map aspectRatio to CSS aspect-ratio value
const ratioMap = { "1:1": "1/1", "4:5": "4/5", "16:9": "16/9" };

function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState({});
    const [savedPosts, setSavedPosts] = useState({});
    const [openComments, setOpenComments] = useState({});
    const [comments, setComments] = useState({});
    const [commentText, setCommentText] = useState({});
    const [commentLoading, setCommentLoading] = useState({});
    const toast = useToast();

    useEffect(() => {
        Promise.all([getAllPosts(), getSavedPostIds()])
            .then(([postData, saveData]) => {
                setPosts(postData.posts || []);
                const savedMap = {};
                (saveData.postIds || []).forEach(id => { savedMap[id] = true; });
                setSavedPosts(savedMap);
            })
            .catch(() => {
                toast.error("Failed to load feed. Please refresh.");
                setPosts([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const toggleLike = (postId) => {
        setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleSave = async (postId) => {
        const was = savedPosts[postId];
        setSavedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
        try {
            await toggleSave(postId);
            if (was) {
                toast.info("Post removed from saved");
            } else {
                toast.success("Post saved to your collection!");
            }
        } catch {
            setSavedPosts((prev) => ({ ...prev, [postId]: was }));
            toast.error("Failed to save post. Please try again.");
        }
    };

    const handleShare = (postId) => {
        const url = `${window.location.origin}/post/${postId}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link copied to clipboard!");
        }).catch(() => {
            toast.warning("Copy this link: " + url);
        });
    };

    const toggleComments = async (postId) => {
        const isOpen = openComments[postId];
        setOpenComments((prev) => ({ ...prev, [postId]: !isOpen }));
        if (!isOpen && !comments[postId]) {
            setCommentLoading((prev) => ({ ...prev, [postId]: true }));
            try {
                const data = await getComments(postId);
                setComments((prev) => ({ ...prev, [postId]: data.comments || [] }));
            } catch {
                toast.error("Failed to load comments.");
                setComments((prev) => ({ ...prev, [postId]: [] }));
            } finally {
                setCommentLoading((prev) => ({ ...prev, [postId]: false }));
            }
        }
    };

    const submitComment = async (e, postId) => {
        e.preventDefault();
        const text = commentText[postId]?.trim();
        if (!text) return;
        try {
            const data = await addComment(postId, text);
            setComments((prev) => ({
                ...prev,
                [postId]: [...(prev[postId] || []), data.comment],
            }));
            setCommentText((prev) => ({ ...prev, [postId]: "" }));
        } catch {
            toast.error("Failed to post comment. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="feed-loading">
                <div className="feed-spinner"></div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="feed-empty">
                <div className="feed-empty-icon">📷</div>
                <h3>No Posts Yet</h3>
                <p>When people share posts, you'll see them here.</p>
            </div>
        );
    }

    return (
        <div className="feed-container">
                {posts.map((post) => {
                    const postComments = comments[post._id] || [];
                    const isCommentsOpen = openComments[post._id];
                    const cssRatio = ratioMap[post.aspectRatio] || "1/1";

                    return (
                        <article className="feed-card" key={post._id}>
                            {/* Card Header */}
                            <div className="feed-card-header">
                                <div className="feed-avatar-wrap">
                                    <div className="feed-avatar-gradient">
                                        <img
                                            src={post.user?.profileImage || "https://ik.imagekit.io/rufox9dki/avatar-default-user-profile-icon-simple-flat-grey-vector-57234191.webp"}
                                            alt={post.user?.username}
                                            className="feed-avatar"
                                        />
                                    </div>
                                </div>
                                <div className="feed-user-info">
                                    <span className="feed-username">{post.user?.username || "unknown"}</span>
                                    <span className="feed-time">{timeAgo(post.createdAt)}</span>
                                </div>
                                <button className="feed-more-btn">•••</button>
                            </div>

                            {/* Post Image */}
                            <div className="feed-image-wrap" style={{ aspectRatio: cssRatio }}>
                                <img
                                    src={post.Image_url}
                                    alt={post.caption || "Post"}
                                    className="feed-image"
                                    onDoubleClick={() => toggleLike(post._id)}
                                />
                            </div>

                            {/* Actions */}
                            <div className="feed-card-body">
                                <div className="feed-actions">
                                    <button
                                        className={`feed-action-btn ${likedPosts[post._id] ? "liked" : ""}`}
                                        onClick={() => toggleLike(post._id)}
                                        aria-label="Like post"
                                        title="Like"
                                    >
                                        {likedPosts[post._id] ? "❤️" : "🤍"}
                                    </button>
                                    <button
                                        className="feed-action-btn"
                                        onClick={() => toggleComments(post._id)}
                                        aria-label="Comment"
                                        title="Comment"
                                    >
                                        💬
                                    </button>
                                    <button
                                        className="feed-action-btn"
                                        onClick={() => handleShare(post._id)}
                                        aria-label="Share"
                                        title="Copy link"
                                    >
                                        ✈️
                                    </button>
                                    <button
                                        className={`feed-action-btn feed-save-btn ${savedPosts[post._id] ? "saved" : ""}`}
                                        onClick={() => handleSave(post._id)}
                                        aria-label="Save"
                                        title={savedPosts[post._id] ? "Unsave" : "Save"}
                                    >
                                        {savedPosts[post._id] ? "🔖" : "🏷️"}
                                    </button>
                                </div>

                                {post.caption && (
                                    <p className="feed-caption">
                                        <span className="feed-caption-user">{post.user?.username}</span>
                                        {" "}{post.caption}
                                    </p>
                                )}

                                {/* View comments toggle */}
                                {!isCommentsOpen && (
                                    <button
                                        className="feed-view-comments"
                                        onClick={() => toggleComments(post._id)}
                                    >
                                        View comments
                                    </button>
                                )}
                            </div>

                            {/* Comments Section */}
                            {isCommentsOpen && (
                                <div className="feed-comments">
                                    <div className="feed-comments-list">
                                        {commentLoading[post._id] ? (
                                            <div className="feed-comments-loading">
                                                <div className="feed-spinner-sm"></div>
                                            </div>
                                        ) : postComments.length === 0 ? (
                                            <p className="feed-no-comments">No comments yet. Be the first!</p>
                                        ) : (
                                            postComments.map((c) => (
                                                <div className="feed-comment-item" key={c._id}>
                                                    <img
                                                        src={c.user?.profileImage || "https://ik.imagekit.io/rufox9dki/avatar-default-user-profile-icon-simple-flat-grey-vector-57234191.webp"}
                                                        alt={c.user?.username}
                                                        className="feed-comment-avatar"
                                                    />
                                                    <div className="feed-comment-content">
                                                        <span className="feed-comment-user">{c.user?.username}</span>
                                                        <span className="feed-comment-text">{c.text}</span>
                                                        <span className="feed-comment-time">{timeAgo(c.createdAt)}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Add comment */}
                                    <form
                                        className="feed-comment-form"
                                        onSubmit={(e) => submitComment(e, post._id)}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Add a comment..."
                                            className="feed-comment-input"
                                            value={commentText[post._id] || ""}
                                            onChange={(e) =>
                                                setCommentText((prev) => ({
                                                    ...prev,
                                                    [post._id]: e.target.value,
                                                }))
                                            }
                                        />
                                        <button
                                            type="submit"
                                            className="feed-comment-submit"
                                            disabled={!commentText[post._id]?.trim()}
                                        >
                                            Post
                                        </button>
                                    </form>
                                </div>
                            )}
                        </article>
                    );
                })}
        </div>
    );
}

export default Feed;
