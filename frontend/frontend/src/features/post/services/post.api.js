import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: `${BASE_URL}/api/post`,
    withCredentials: true
});

const saveApi = axios.create({
    baseURL: `${BASE_URL}/api/save`,
    withCredentials: true
});

const reelApi = axios.create({
    baseURL: `${BASE_URL}/api/reel`,
    withCredentials: true
});

// ── Posts ──────────────────────────────────────────────
export async function getMyPosts() {
    const response = await api.get("/");
    return response.data;
}

export async function getAllPosts() {
    const response = await api.get("/feed");
    return response.data;
}

export async function createPost(formData) {
    const response = await api.post("/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
}

export async function getPostById(postId) {
    const response = await api.get(`/${postId}`);
    return response.data;
}

// ── Comments ───────────────────────────────────────────
export async function getComments(postId) {
    const response = await api.get(`/${postId}/comments`);
    return response.data;
}

export async function addComment(postId, text) {
    const response = await api.post(`/${postId}/comment`, { text });
    return response.data;
}

export async function getReelComments(reelId) {
    const response = await api.get(`/reel/${reelId}/comments`);
    return response.data;
}

export async function addReelComment(reelId, text) {
    const response = await api.post(`/reel/${reelId}/comment`, { text });
    return response.data;
}

// ── Saves ──────────────────────────────────────────────
export async function toggleSave(postId) {
    const response = await saveApi.post(`/${postId}`);
    return response.data;
}

export async function getSavedPosts() {
    const response = await saveApi.get("/");
    return response.data;
}

export async function getSavedPostIds() {
    const response = await saveApi.get("/ids");
    return response.data;
}

// ── Reels ──────────────────────────────────────────────
export async function getAllReels() {
    const response = await reelApi.get("/");
    return response.data;
}

export async function createReel(formData) {
    const response = await reelApi.post("/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
}
