import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import Login from "./features/auth/pages/login.jsx";
import Register from "./features/auth/pages/register.jsx";
import Feed from "./features/post/pages/Feed.jsx";
import Profile from "./features/post/pages/Profile.jsx";
import Reels from "./features/post/pages/Reels.jsx";
import SavedPosts from "./features/post/pages/SavedPosts.jsx";
import Search from "./features/post/pages/Search.jsx";
import SinglePost from "./features/post/pages/SinglePost.jsx";
import Layout from "./components/Layout.jsx";
import { useAuth } from "./features/auth/hooks/useAuth.js";

// Guard: redirects to /login if not authenticated
function ProtectedLayout() {
    const { user, loading } = useAuth();

    if (loading) {
        return React.createElement(
            "div",
            {
                style: {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    background: "#000"
                }
            },
            React.createElement("style", null, "@keyframes spin { to { transform: rotate(360deg); } }"),
            React.createElement("div", {
                style: {
                    width: 36,
                    height: 36,
                    border: "3px solid #333",
                    borderTopColor: "#bc1888",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                }
            })
        );
    }

    if (!user) {
        return React.createElement(Navigate, { to: "/login", replace: true });
    }

    return React.createElement(
        Layout,
        null,
        React.createElement(Outlet)
    );
}

// Guard: redirects authenticated users away from login/register
function GuestOnly() {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return React.createElement(Navigate, { to: "/feed", replace: true });
    return React.createElement(Outlet);
}

export const routes = createBrowserRouter([
    {
        path: "/",
        element: React.createElement(Navigate, { to: "/feed", replace: true })
    },
    {
        element: React.createElement(GuestOnly),
        children: [
            { path: "/login",    element: React.createElement(Login) },
            { path: "/register", element: React.createElement(Register) }
        ]
    },
    {
        element: React.createElement(ProtectedLayout),
        children: [
            { path: "/feed",    element: React.createElement(Feed) },
            { path: "/profile", element: React.createElement(Profile) },
            { path: "/reels",   element: React.createElement(Reels) },
            { path: "/saved",   element: React.createElement(SavedPosts) },
            { path: "/search",  element: React.createElement(Search) },
            { path: "/post/:postId", element: React.createElement(SinglePost) },
            { path: "/:username", element: React.createElement(Profile) },
        ]
    }
]);