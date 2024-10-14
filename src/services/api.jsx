// Agregar url base de los endpoints de la API. En este caso, levanto la api en el puerto 5001 del localhost.
const API_URL = "http://localhost:5001";

export const sendMessageToAssistant = async (message) => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question: message })
    });

    if (!response.ok) {
      throw new Error(`Error sending message to assistant: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message to assistant:", error);
    throw error;
  }
};
