import { useState, useEffect, useRef, useCallback } from "react";
import { getAllReels, createReel, getReelComments, addReelComment } from "../services/post.api.js";
import { useToast } from "../../../components/Toast/ToastContext.jsx";
import "./Reels.scss";

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
}

// Single reel card — autoplays when in viewport
function ReelCard({ reel }) {
    const videoRef = useRef(null);
    const [muted, setMuted] = useState(true);
    const [playing, setPlaying] = useState(false);
    const [liked, setLiked] = useState(false);
    const toast = useToast();

    // Comments state
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    const observer = useRef(null);

    useEffect(() => {
        observer.current = new IntersectionObserver(
            ([entry]) => {
                if (!videoRef.current) return;
                if (entry.isIntersecting) {
                    videoRef.current.play().catch(() => {});
                    setPlaying(true);
                } else {
                    videoRef.current.pause();
                    setPlaying(false);
                }
            },
            { threshold: 0.65 }
        );
        if (videoRef.current) observer.current.observe(videoRef.current);
        return () => observer.current?.disconnect();
    }, []);

    const toggleMute = (e) => {
        e.stopPropagation();
        setMuted((m) => {
            if (videoRef.current) videoRef.current.muted = !m;
            return !m;
        });
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (playing) {
            videoRef.current.pause();
            setPlaying(false);
        } else {
            videoRef.current.play();
            setPlaying(true);
        }
    };

    const handleToggleComments = async (e) => {
        e.stopPropagation();
        setIsCommentsOpen(!isCommentsOpen);
        if (!isCommentsOpen && comments.length === 0) {
            setCommentLoading(true);
            try {
                const data = await getReelComments(reel._id);
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
            const data = await addReelComment(reel._id, commentText.trim());
            setComments([...comments, data.comment]);
            setCommentText("");
        } catch {
            toast.error("Failed to post comment.");
        }
    };

    return (
        <div className="reel-card">
            <div className="reel-video-wrap" onClick={togglePlay}>
                <video
                    ref={videoRef}
                    src={reel.video_url}
                    className="reel-video"
                    loop
                    muted={muted}
                    playsInline
                    preload="metadata"
                />

                {/* Play/Pause overlay */}
                {!playing && (
                    <div className="reel-play-overlay">
                        <span>▶</span>
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="reel-gradient" />

                {/* Info overlay */}
                <div className="reel-info">
                    <div className="reel-user">
                        <div className="reel-avatar-ring">
                            <img
                                src={reel.user?.profileImage || "https://ik.imagekit.io/rufox9dki/avatar-default-user-profile-icon-simple-flat-grey-vector-57234191.webp"}
                                alt={reel.user?.username}
                                className="reel-avatar"
                            />
                        </div>
                        <div>
                            <p className="reel-username">{reel.user?.username}</p>
                            <p className="reel-time">{timeAgo(reel.createdAt)}</p>
                        </div>
                    </div>
                    {reel.caption && <p className="reel-caption">{reel.caption}</p>}
                </div>

                {/* Controls (right side) */}
                <div className="reel-controls">
                    <button
                        className={`reel-action ${liked ? "liked" : ""}`}
                        onClick={(e) => { e.stopPropagation(); setLiked((l) => !l); }}
                        aria-label="Like"
                    >
                        <span className="reel-action-icon">{liked ? "❤️" : "🤍"}</span>
                        <span className="reel-action-label">Like</span>
                    </button>
                    <button
                        className="reel-action"
                        onClick={handleToggleComments}
                        aria-label="Comment"
                    >
                        <span className="reel-action-icon">💬</span>
                        <span className="reel-action-label">Comment</span>
                    </button>
                    <button
                        className="reel-action"
                        onClick={toggleMute}
                        aria-label={muted ? "Unmute" : "Mute"}
                    >
                        <span className="reel-action-icon">{muted ? "🔇" : "🔊"}</span>
                        <span className="reel-action-label">{muted ? "Unmute" : "Mute"}</span>
                    </button>
                </div>

                {/* Comments Section */}
                <div className={`feed-comments-section reel-comments ${isCommentsOpen ? "open" : ""}`} onClick={e => e.stopPropagation()}>
                    <div className="reel-comments-header">
                        <h3>Comments</h3>
                        <button className="close-comments" onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(false); }}>✕</button>
                    </div>
                    {commentLoading ? (
                        <div className="comments-loading">Loading...</div>
                    ) : (
                        <div className="comments-list">
                            {comments.length === 0 ? (
                                <div className="no-comments">No comments yet.</div>
                            ) : (
                                comments.map(c => (
                                    <div key={c._id} className="comment-item">
                                        <img src={c.user?.profileImage} alt="" className="comment-avatar" />
                                        <div className="comment-content">
                                            <span className="comment-user">{c.user?.username}</span>
                                            <span className="comment-text">{c.text}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    <form className="comment-input-form" onSubmit={submitComment}>
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="comment-input"
                        />
                        <button type="submit" className="comment-submit" disabled={!commentText.trim()}>Post</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function Reels() {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [caption, setCaption] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const toast = useToast();

    const fetchReels = () => {
        setLoading(true);
        getAllReels()
            .then((data) => setReels(data.reels || []))
            .catch(() => {
                toast.error("Failed to load reels. Please refresh.");
                setReels([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchReels();
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setVideoPreview(URL.createObjectURL(file));
        setShowUpload(true);
        e.target.value = "";
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("caption", caption);
            await createReel(formData);
            toast.success("Reel uploaded successfully! 🎥");
            setShowUpload(false);
            setCaption("");
            setSelectedFile(null);
            setVideoPreview(null);
            fetchReels();
        } catch (err) {
            const msg = err?.response?.data?.message || "Failed to upload reel. Please try again.";
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    const closeUpload = () => {
        setShowUpload(false);
        setCaption("");
        setSelectedFile(null);
        setVideoPreview(null);
    };

    if (loading) {
        return (
            <div className="reels-loading">
                <div className="feed-spinner"></div>
            </div>
        );
    }

    return (
        <div className="reels-page">
            {/* Upload button */}
            <div className="reels-header">
                <h2 className="reels-title">Reels</h2>
                <button
                    className="reels-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                >
                    + Create Reel
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                />
            </div>

            {reels.length === 0 ? (
                <div className="reels-empty">
                    <div className="reels-empty-icon">🎬</div>
                    <h3>No Reels Yet</h3>
                    <p>Be the first to share a reel!</p>
                    <button
                        className="profile-empty-btn"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Create your first reel
                    </button>
                </div>
            ) : (
                <div className="reels-feed">
                    {reels.map((reel) => (
                        <ReelCard key={reel._id} reel={reel} />
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <div className="upload-modal-overlay" onClick={closeUpload}>
                    <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="upload-modal-header">
                            <h3>Create new reel</h3>
                            <button className="upload-modal-close" onClick={closeUpload}>✕</button>
                        </div>
                        <div className="upload-modal-body">
                            {videoPreview && (
                                <div className="upload-preview">
                                    <video
                                        src={videoPreview}
                                        controls
                                        style={{ width: "100%", maxHeight: 300, objectFit: "contain", background: "#000" }}
                                    />
                                </div>
                            )}
                            <form onSubmit={handleUpload} className="upload-form">
                                <textarea
                                    placeholder="Write a caption..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="upload-caption"
                                    rows={3}
                                />
                                <button
                                    type="submit"
                                    className="upload-submit-btn"
                                    disabled={uploading}
                                >
                                    {uploading ? "Uploading reel..." : "Share Reel"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reels;
