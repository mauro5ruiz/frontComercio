import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false, // true sera cuando cookies / auth
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;