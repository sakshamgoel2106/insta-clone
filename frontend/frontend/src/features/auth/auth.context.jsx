import { createContext, useState, useEffect } from "react";
import { login, register, getme, logout, updateProfile } from "./services/auth.api.js";

export const AuthContext = createContext();

export function AuthProvider({children}) {

    const [user, setuser] = useState(null);
    const [loading, setloading] = useState(true);

    useEffect(() => {
        getme()
            .then((response) => {
                setuser(response.user);
            })
            .catch(() => {
                setuser(null);
            })
            .finally(() => {
                setloading(false);
            });
    }, []);

    const handlelogin = async ( email, password ) => {
        setloading(true);
        try {
            const response = await login(email, password);
            setuser(response.user);
        } catch (err) {
            throw err;
        }finally{
            setloading(false);
        }
    }


    const handleregister = async ( username, email, password ) => {
        setloading(true);
        try {
            const response = await register(username, email, password);
            setuser(response.user);
        } catch (err) {
            throw err;
        }finally{
            setloading(false);
        }
    }

    const handlelogout = async () => {
        try {
            await logout();
        } catch (err) {
            // ignore errors — still clear local state
        } finally {
            setuser(null);
        }
    }

    const handleUpdateProfile = async (formData) => {
        setloading(true);
        try {
            const response = await updateProfile(formData);
            setuser(response.user);
            return response;
        } catch (err) {
            throw err;
        } finally {
            setloading(false);
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            handlelogin,
            handleregister,
            handlelogout,
            handleUpdateProfile
        }}>
            {children}
        </AuthContext.Provider>
    )



}