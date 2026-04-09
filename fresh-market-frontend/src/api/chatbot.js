import { API } from "./auth";

export const chatWithBot = async (data) => {
  try {
    const response = await fetch(`${API}/chatbot/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.code !== 1000) {
      throw new Error(result.message || "Something went wrong");
    }

    return result.result;
  } catch (error) {
    console.error("Chatbot API Error:", error);
    throw error;
  }
};
