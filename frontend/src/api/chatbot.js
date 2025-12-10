import axios from "axios";

const chatbotAPI = axios.create({
  baseURL: "https://unimart-bot.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendMessageToBot = (message) =>
  chatbotAPI.post("/chat", { message });
