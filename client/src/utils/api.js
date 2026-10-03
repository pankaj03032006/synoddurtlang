import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL || "http://localhost:5000",
    headers: { "Content-Type": "application/json" },
});

// Attach the latest token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;