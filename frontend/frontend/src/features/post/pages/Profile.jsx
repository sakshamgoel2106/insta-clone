import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { getUserProfile, toggleFollow } from "../../auth/services/auth.api.js";
import { createPost } from "../services/post.api.js";
import { useToast } from "../../../components/Toast/ToastContext.jsx";
import "./Profile.scss";

const ASPECT_RATIOS = [
    { id: "1:1", label: "Square", icon: "⬜", css: "1/1", style: { width: 40, height: 40 } },
    { id: "4:5", label: "Portrait", icon: "📱", css: "4/5", style: { width: 32, height: 40 } },
    { id: "16:9", label: "Landscape", icon: "🖥️", css: "16/9", style: { width: 40, height: 22 } },
];

function Profile() {
    const { username } = useParams();
    const { user: authUser, handleUpdateProfile } = useAuth();
    const toast = useToast();

    const isOwnProfile = !username || username === authUser?.username;
    
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Active tab
    const [activeTab, setActiveTab] = useState("posts"); // "posts" or "reels"

    // Follow state (if not own profile)
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    // Modal state (Upload)
    const [modalStep, setModalStep] = useState(0); 
    const [caption, setCaption] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [aspectRatio, setAspectRatio] = useState("1:1");
    const fileInputRef = useRef(null);

    // Modal state (Edit Profile)
    const [showEditModal, setShowEditModal] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editProfileImg, setEditProfileImg] = useState(null);
    const [editPreview, setEditPreview] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const editImgRef = useRef(null);

    const fetchProfileData = () => {
        setLoading(true);
        const targetUsername = username || authUser?.username;
        if (!targetUsername) return;

        getUserProfile(targetUsername)
            .then((data) => {
                setProfileUser(data.user);
                setPosts(data.posts || []);
                setReels(data.reels || []);
                if (authUser && data.user) {
                    setIsFollowing(data.user.followers?.includes(authUser._id));
                }
            })
            .catch(() => {
                toast.error("Failed to load profile. User might not exist.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProfileData();
    }, [username, authUser]);

    const handleFollowToggle = async () => {
        if (!profileUser) return;
        setFollowLoading(true);
        try {
            await toggleFollow(profileUser._id);
            setIsFollowing(!isFollowing);
            toast.success(isFollowing ? "Unfollowed successfully" : "Followed successfully");
            fetchProfileData(); // Refresh counts
        } catch {
            toast.error("Failed to update follow status.");
        } finally {
            setFollowLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setAspectRatio("1:1");
        setModalStep(1);
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
            formData.append("aspectRatio", aspectRatio);
            await createPost(formData);
            toast.success("Post shared successfully! 🎉");
            closeModal();
            fetchProfileData();
        } catch (err) {
            toast.error("Failed to share post. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const closeModal = () => {
        setModalStep(0);
        setCaption("");
        setSelectedFile(null);
        setPreview(null);
        setAspectRatio("1:1");
    };

    const openEditModal = () => {
        setEditUsername(profileUser?.username || "");
        setEditBio(profileUser?.bio || "");
        setEditProfileImg(null);
        setEditPreview(profileUser?.profileImage || null);
        setShowEditModal(true);
    };

    const handleEditImgSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEditProfileImg(file);
        setEditPreview(URL.createObjectURL(file));
        e.target.value = "";
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const formData = new FormData();
            formData.append("username", editUsername);
            formData.append("bio", editBio);
            if (editProfileImg) {
                formData.append("profileImage", editProfileImg);
            }
            await handleUpdateProfile(formData);
            toast.success("Profile updated successfully! ✨");
            setShowEditModal(false);
            fetchProfileData();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update profile.");
        } finally {
            setSavingProfile(false);
        }
    };

    const selectedRatio = ASPECT_RATIOS.find((r) => r.id === aspectRatio);

    if (loading && !profileUser) {
        return (
            <div className="profile-grid-loading">
                <div className="feed-spinner"></div>
            </div>
        );
    }

    if (!profileUser) {
        return <div className="profile-empty"><h3>User not found</h3></div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar-wrap">
                    <div className="profile-avatar-gradient">
                        <img
                            src={profileUser.profileImage || "https://ik.imagekit.io/rufox9dki/avatar-default-user-profile-icon-simple-flat-grey-vector-57234191.webp"}
                            alt={profileUser.username}
                            className="profile-avatar"
                        />
                    </div>
                </div>

                <div className="profile-info">
                    <div className="profile-username-row">
                        <h2 className="profile-username">{profileUser.username}</h2>
                        
                        {isOwnProfile ? (
                            <>
                                <button className="profile-upload-btn" onClick={() => fileInputRef.current?.click()}>
                                    + New Post
                                </button>
                                <button className="profile-edit-btn" onClick={openEditModal}>
                                    Edit Profile
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleFileSelect}
                                />
                            </>
                        ) : (
                            <button 
                                className={`profile-follow-btn ${isFollowing ? 'following' : ''}`}
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                        )}
                    </div>

                    <div className="profile-stats">
                        <div className="profile-stat">
                            <strong>{posts.length}</strong>
                            <span>posts</span>
                        </div>
                        <div className="profile-stat">
                            <strong>{profileUser.followers?.length || 0}</strong>
                            <span>followers</span>
                        </div>
                        <div className="profile-stat">
                            <strong>{profileUser.following?.length || 0}</strong>
                            <span>following</span>
                        </div>
                    </div>

                    {profileUser.bio && <p className="profile-bio">{profileUser.bio}</p>}
                </div>
            </div>

            <div className="profile-tabs">
                <button 
                    className={`profile-tab ${activeTab === "posts" ? "active" : ""}`}
                    onClick={() => setActiveTab("posts")}
                >
                    <span>⊞</span> POSTS
                </button>
                <button 
                    className={`profile-tab ${activeTab === "reels" ? "active" : ""}`}
                    onClick={() => setActiveTab("reels")}
                >
                    <span>🎬</span> REELS
                </button>
            </div>

            {/* Posts Grid */}
            {activeTab === "posts" && (
                posts.length === 0 ? (
                    <div className="profile-empty">
                        <div className="profile-empty-icon">📷</div>
                        <h3>No Photos</h3>
                        {isOwnProfile && <p>When you share photos, they'll appear on your profile.</p>}
                    </div>
                ) : (
                    <div className="profile-grid">
                        {posts.map((post) => (
                            <Link to={`/post/${post._id}`} className="profile-grid-item" key={post._id}>
                                <img src={post.Image_url} alt={post.caption || "Post"} />
                                <div className="profile-grid-overlay">
                                    <span>❤️</span>
                                    {post.caption && <span className="overlay-caption">{post.caption}</span>}
                                </div>
                            </Link>
                        ))}
                    </div>
                )
            )}

            {/* Reels Grid */}
            {activeTab === "reels" && (
                reels.length === 0 ? (
                    <div className="profile-empty">
                        <div className="profile-empty-icon">🎬</div>
                        <h3>No Reels</h3>
                        {isOwnProfile && <p>Share a reel from the Reels tab!</p>}
                    </div>
                ) : (
                    <div className="profile-grid reels-grid">
                        {reels.map((reel) => (
                            <div className="profile-grid-item" key={reel._id}>
                                <video src={reel.video_url} className="reel-thumbnail" muted playsInline />
                                <div className="profile-grid-overlay">
                                    <span>🎬</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* CREATE POST MODAL */}
            {modalStep > 0 && (
                <div className="upload-modal-overlay" onClick={closeModal}>
                    <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="upload-modal-header">
                            <button className="upload-back-btn" onClick={() => {
                                if (modalStep === 2) setModalStep(1);
                                else closeModal();
                            }}>←</button>
                            <h3>{modalStep === 1 ? "Crop" : "New Post"}</h3>
                            {modalStep === 1 ? (
                                <button className="upload-next-btn" onClick={() => setModalStep(2)}>Next</button>
                            ) : (
                                <button className="upload-next-btn" onClick={handleUpload} disabled={uploading}>
                                    {uploading ? "Sharing..." : "Share"}
                                </button>
                            )}
                        </div>

                        <div className="upload-modal-body">
                            {modalStep === 1 ? (
                                <div className="upload-crop-step">
                                    <div className="upload-preview-container" style={{ aspectRatio: selectedRatio.css }}>
                                        <img src={preview} alt="Preview" className="upload-preview" />
                                    </div>
                                    <div className="upload-ratio-picker">
                                        {ASPECT_RATIOS.map((r) => (
                                            <button
                                                key={r.id}
                                                className={`ratio-btn ${aspectRatio === r.id ? "active" : ""}`}
                                                onClick={() => setAspectRatio(r.id)}
                                            >
                                                <span className="ratio-icon">{r.icon}</span>
                                                <span className="ratio-label">{r.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="upload-details-step">
                                    <div className="upload-mini-preview" style={{ aspectRatio: selectedRatio.css }}>
                                        <img src={preview} alt="Mini Preview" />
                                    </div>
                                    <textarea
                                        className="upload-caption"
                                        placeholder="Write a caption..."
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        rows="4"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT PROFILE MODAL */}
            {showEditModal && (
                <div className="upload-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="upload-modal-header">
                            <button className="upload-back-btn" onClick={() => setShowEditModal(false)}>✕</button>
                            <h3>Edit Profile</h3>
                            <button className="upload-next-btn" onClick={handleSaveProfile} disabled={savingProfile}>
                                {savingProfile ? "Saving..." : "Save"}
                            </button>
                        </div>
                        <div className="upload-modal-body" style={{ padding: "1.5rem" }}>
                            <form onSubmit={handleSaveProfile} className="edit-profile-form">
                                <div className="edit-profile-img-section">
                                    <img src={editPreview || "https://ik.imagekit.io/rufox9dki/avatar-default-user-profile-icon-simple-flat-grey-vector-57234191.webp"} alt="Edit Preview" className="edit-profile-avatar" />
                                    <button
                                        type="button"
                                        className="change-photo-btn"
                                        onClick={() => editImgRef.current?.click()}
                                    >
                                        Change Profile Photo
                                    </button>
                                    <input
                                        ref={editImgRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleEditImgSelect}
                                    />
                                </div>

                                <label className="edit-profile-label" style={{ marginBottom: "0.5rem" }}>
                                    Username
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        className="upload-caption"
                                        required
                                    />
                                </label>

                                <label className="edit-profile-label">
                                    Bio
                                    <textarea
                                        placeholder="Write something about yourself..."
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        className="upload-caption"
                                        rows={3}
                                    />
                                </label>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
