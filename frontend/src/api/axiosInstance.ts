import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
