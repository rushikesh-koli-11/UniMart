import axios from "axios";

const chatbotAPI = axios.create({
  baseURL: "https://unimart-bot.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendMessageToBot = async (message) => {
  const res = await chatbotAPI.post("/chat", { message });

  if (!res?.data?.response) {
    throw new Error("Invalid chatbot response");
  }

  return res.data;
};
