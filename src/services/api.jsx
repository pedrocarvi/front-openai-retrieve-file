import apiClient from "../axiosConfig";

// Envio mensaje y el mismo endpoint me devuelve la respuesta a la pregunta.
export const sendMessageToAssistant = async (message, chatId, isToggled) => {
  // console.log("Guarda chat? ", isToggled)
  try {
    const response = await apiClient.post('/chat', { question: message, chatId: chatId, saveThread: isToggled });
    return response.data;
  } catch (error) {
    console.error("Error sending message to assistant:", error);
    throw error;
  }
};

export const startNewChat = async () => {
  try {
    const response = await apiClient.post('/chats');
    return response.data;
  } catch (error) {
    console.error("Error starting new chat:", error);
    throw error;
  }
};

export const fetchChats = async () => {
  try {
    const response = await apiClient.get('/chats');
    return response.data;
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }
};

export const deleteChat = async(chatId) => {
  try {
    const response = await apiClient.delete(`/chats/${chatId}`);
    return response.data;
  } catch (error){
    console.error("Error fetching chats:", error);
    throw error;
  }
}