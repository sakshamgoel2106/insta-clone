import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { getPostById, getComments, addComment, toggleSave, getSavedPostIds } from "../services/post.api.js";
import { useToast } from "../../../components/Toast/ToastContext.jsx";
import "./Feed.scss"; // Reuse Feed styles

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

const ratioMap = { "1:1": "1/1", "4:5": "4/5", "16:9": "16/9" };

function SinglePost() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Interactions
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    
    // Comments
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.all([getPostById(postId), getSavedPostIds()])
            .then(([postData, saveData]) => {
                setPost(postData.post);
                const isSaved = (saveData.postIds || []).includes(postId);
                setIsSaved(isSaved);
            })
            .catch(() => {
                toast.error("Post not found.");
                navigate("/feed");
            })
            .finally(() => setLoading(false));
    }, [postId]);

    const handleToggleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleToggleSave = async () => {
        const wasSaved = isSaved;
        setIsSaved(!isSaved);
        try {
            await toggleSave(postId);
            if (wasSaved) {
                toast.info("Post removed from saved");
            } else {
                toast.success("Post saved to your collection!");
            }
        } catch {
            setIsSaved(wasSaved);
            toast.error("Failed to save post.");
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/post/${postId}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link copied to clipboard!");
        }).catch(() => {
            toast.warning("Copy this link: " + url);
        });
    };

    const handleToggleComments = async () => {
        setIsCommentsOpen(!isCommentsOpen);
        if (!isCommentsOpen && comments.length === 0) {
            setCommentLoading(true);
            try {
                const data = await getComments(postId);
                setComments(data.comments || []);
            } catch {
                toast.error("Failed to load comments.");
            } finally {
                setCommentLoading(false);
            }
        }
    };

    const submitComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const data = await addComment(postId, commentText.trim());
            setComments([...comments, data.comment]);
            setCommentText("");
        } catch {
            toast.error("Failed to post comment.");
        }
    };

    if (loading) {
        return (
            <div className="feed-loading">
                <div className="feed-spinner"></div>
            </div>
        );
    }

    if (!post) return null;

    const cssRatio = ratioMap[post.aspectRatio] || "1/1";

    return (
        <div className="feed-container" style={{ paddingTop: "2rem" }}>
            <button className="profile-edit-btn" style={{ marginBottom: "1rem", alignSelf: "flex-start" }} onClick={() => navigate(-1)}>
                ← Back
            </button>
            <article className="feed-card">
                {/* Header */}
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
                        <span className="feed-username">{post.user?.username}</span>
                        <span className="feed-time">• {timeAgo(post.createdAt)}</span>
                    </div>
                    <button className="feed-more-btn">⋮</button>
                </div>

                {/* Media */}
                <div className="feed-image-container" style={{ aspectRatio: cssRatio }} onDoubleClick={handleToggleLike}>
                    <img src={post.Image_url} alt="Post" className="feed-image" />
                    <div className={`feed-like-animation ${isLiked ? 'animate' : ''}`}>❤️</div>
                </div>

                {/* Card Body for Actions, Caption, Comments */}
                <div className="feed-card-body">
                    {/* Actions */}
                    <div className="feed-actions">
                        <div className="feed-actions-left">
                            <button className="feed-action-btn" onClick={handleToggleLike}>
                                {isLiked ? <span className="icon-liked">❤️</span> : <span>♡</span>}
                            </button>
                            <button className="feed-action-btn" onClick={handleToggleComments}>
                                💬
                            </button>
                            <button className="feed-action-btn" onClick={handleShare}>
                                ✈️
                            </button>
                        </div>
                        <div className="feed-actions-right">
                            <button className="feed-action-btn" onClick={handleToggleSave}>
                                {isSaved ? <span className="icon-saved">🔖</span> : <span>🏷️</span>}
                            </button>
                        </div>
                    </div>

                    {/* Caption */}
                    <div className="feed-content">
                        <p className="feed-caption">
                            <span className="feed-caption-user">{post.user?.username}</span> {post.caption}
                        </p>
                    </div>

                    {/* Comments Section */}
                    {isCommentsOpen && (
                        <div className="feed-comments">
                            <div className="feed-comments-list">
                                {commentLoading ? (
                                    <div className="feed-comments-loading">
                                        <div className="feed-spinner-sm"></div>
                                    </div>
                                ) : comments.length === 0 ? (
                                    <p className="feed-no-comments">No comments yet. Be the first!</p>
                                ) : (
                                    comments.map((c) => (
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
                                onSubmit={submitComment}
                            >
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    className="feed-comment-input"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="feed-comment-submit"
                                    disabled={!commentText.trim()}
                                >
                                    Post
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </article>
        </div>
    );
}

export default SinglePost;
