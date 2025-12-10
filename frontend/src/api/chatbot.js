import axios from "axios";

const chatbotAPI = axios.create({
  baseURL: "https://unimart-bot.onrender.com",
  timeout: 60000, // ✅ VERY IMPORTANT (cold starts)
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendMessageToBot = async (message) => {
  const res = await chatbotAPI.post("/chat", { message });

  // Optional: handle warm-up gracefully
  if (res.data?.response?.includes("warming up")) {
    throw new Error("Bot is warming up");
  }

  return res.data;
};
