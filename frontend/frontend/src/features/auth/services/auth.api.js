import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth`,
    withCredentials:true
})
export async function register (username,email,password){
    try{
        const response = await api.post("/register"
        ,{
            username,
            email,
            password
        })

        return response.data;
        }
    catch(err){
        throw err;
    }

}

export async function login (identifier,password){
    try{
        const response = await api.post("/login",{
            username: identifier,
            email: identifier,
            password
        })

        return response.data;


    }catch(err){
        throw err;
    }
}

export async function getme(){
    try{
        const response = await api.get("/get-me")
        return response.data;
        }
        catch(err){
            throw err;
        }
    }

export async function logout(){
    try{
        const response = await api.post("/logout")
        return response.data;
    }catch(err){
        throw err;
    }
}

export async function updateProfile(formData){
    try{
        const response = await api.put("/profile", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }catch(err){
        throw err;
    }
}

export async function searchUsers(query) {
    const response = await api.get(`/search?q=${query}`);
    return response.data;
}

export async function getUserProfile(username) {
    const response = await api.get(`/user/${username}`);
    return response.data;
}

export async function toggleFollow(userId) {
    const response = await api.post(`/follow/${userId}`);
    return response.data;
}
