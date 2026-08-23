# 📸 Instaclone: Full-Stack MERN Social Media App

Instaclone is a fully-featured social media platform built using the MERN stack (MongoDB, Express, React, Node.js). It replicates the core functionalities of modern photo and video sharing applications.

## ✨ Features
- **User Authentication:** Secure JWT-based registration and login.
- **Profiles:** Custom avatars, bios, and follower/following metrics.
- **Posts (Feed):** Upload photos with different aspect ratios, like, and comment on posts.
- **Reels:** Upload and seamlessly scroll through full-screen short-form videos.
- **Social Graph:** Search for users and follow/unfollow them in real-time.
- **Bookmarks:** Save posts to your personal collection.
- **Image/Video Hosting:** Integration with ImageKit for fast media delivery.

---

## 🏗️ The React 4-Layer Architecture

The frontend of this application is meticulously designed using a modern **4-Layer Architecture Pattern** to ensure the code is scalable, maintainable, and deeply separated by concern.

### 1. 🖥️ The UI / View Layer (`pages/`, `components/`)
This layer is strictly responsible for rendering the UI and interacting with the user.
- **What it does:** Displays data to the user and captures user inputs (clicks, typing, scrolling).
- **Rules:** It contains minimal business logic. It mostly delegates actions to the layers below it.
- **Examples:** `Profile.jsx` (displays user profile), `SinglePost.jsx` (renders a single image and comment section), `Layout.jsx` (global sidebar).

### 2. 🧠 The State / Business Logic Layer (`hooks/`, Context API)
This layer manages the global and local state of the application. 
- **What it does:** Stores data that needs to be shared across multiple components and handles the logic for modifying that data.
- **Rules:** Keeps complex state transformations out of the UI layer.
- **Examples:** `useAuth.js` (custom hook that manages the `authUser` state across the entire app), `ToastContext.jsx` (manages popup alerts globally).

### 3. 🔌 The Service / Data Fetching Layer (`services/*.api.js`)
This layer is the bridge between the React frontend and the Express backend.
- **What it does:** Contains all Axios instances and functions that make HTTP requests. 
- **Rules:** React components *never* make `fetch` or `axios` calls directly. They import functions from this layer.
- **Examples:** `post.api.js` (contains `getMyPosts()`, `savePost()`), `auth.api.js` (contains `register()`, `toggleFollow()`). By centralizing this, if the backend URL changes, we only update one place.

### 4. 🗺️ The Routing Layer (`routes.js`, React Router)
This layer manages navigation and url-to-component mapping.
- **What it does:** Determines which UI component from Layer 1 should be rendered based on the current URL.
- **Rules:** Handles route protection (e.g., redirecting unauthenticated users to the login page).
- **Examples:** `routes.js` (defines `/feed`, `/reels`, `/profile/:username`).

---

## ⚙️ Tech Stack
**Frontend:** React 18, Vite, React Router DOM v7, Axios, SCSS
**Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT, Multer, ImageKit
