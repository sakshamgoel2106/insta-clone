import { RouterProvider } from "react-router";
import { routes } from "./routes.js";
import "./style.scss";
import { AuthProvider } from "./features/auth/auth.context.jsx";
import { ToastProvider } from "./components/Toast/ToastContext.jsx";
import { ToastContainer } from "./components/Toast/Toast.jsx";

function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <RouterProvider router={routes} />
                <ToastContainer />
            </AuthProvider>
        </ToastProvider>
    );
}

export default App;
