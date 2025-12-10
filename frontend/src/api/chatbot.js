import axios from "axios";

const chatbotAPI = axios.create({
  baseURL: "https://unimart-bot.onrender.com",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ✅ Retry once on cold start */
chatbotAPI.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.code === "ECONNABORTED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      console.warn("Cold start detected. Retrying request...");
      return chatbotAPI(originalRequest);
    }

    return Promise.reject(error);
  }
);

export const sendMessageToBot = async (message) => {
  const res = await chatbotAPI.post("/chat", { message });

  if (!res?.data?.response) {
    throw new Error("Invalid chatbot response");
  }

  return res.data;
};
