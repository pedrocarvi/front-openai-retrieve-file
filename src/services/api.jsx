import apiClient from "../axiosConfig";

// Envio mensaje y el mismo endpoint me devuelve la respuesta a la pregunta.
export const sendMessageToAssistant = async (message) => {
  try {
    const response = await apiClient.post('/chat', {question: message})
    return response.data;
  } catch (error) {
    console.error("Error sending message to assistant:", error);
    throw error;
  }
};

export const getUserConversations = async () => {
  try {
    const response = await apiClient.get("/threads");
    return response.data
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    throw error;    
  }
}