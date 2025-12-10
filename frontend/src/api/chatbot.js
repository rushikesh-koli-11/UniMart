import axios from "axios";

const chatbotAPI = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendMessageToBot = (message) =>
  chatbotAPI.post("/chat", { message });
