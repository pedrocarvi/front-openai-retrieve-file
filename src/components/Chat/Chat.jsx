import React, { useEffect, useState } from "react";
import "./Chat.css";
import { getUserConversations, sendMessageToAssistant } from "../../services/api";
import CodeBlock from "../CodeBlock/Codeblock";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [threads, setThreads] = useState([]); 
  
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const userThreads = await getUserConversations();  // Fetch existing threads
        setThreads(userThreads.threads || []);             // Set it to state
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };

    fetchThreads();
  }, []); 

  function parseMessageContent(text) {
    const regex = /```(\w+)?\n([\s\S]*?)```/g; // Captura bloques de código
    const parts = [];
    let lastIndex = 0;
    let match;
  
    // Busca todos los bloques de código y partes de texto
    while ((match = regex.exec(text)) !== null) {
      // Captura el texto antes del bloque de código
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
  
      // Captura el bloque de código
      parts.push({ type: 'code', content: match[2], language: match[1] || 'javascript' });
      lastIndex = regex.lastIndex;
    }
  
    // Captura cualquier texto restante después del último bloque de código
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }
  
    return parts;
  }
  
 
  // Funcion para enviar mensajes
  const sendMessage = async (event) => {
    event.preventDefault();
    if (inputValue.trim() === "") return;

    // Agregar el mensaje del usuario directamente
    setMessages([...messages, { type: "user", text: [{ type: "text", content: inputValue }] }]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await sendMessageToAssistant(inputValue);

      // Asignar la respuesta de la API como partes procesadas (texto + código)
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "ai", text: parseMessageContent(response.response) },
      ]);

      setIsTyping(false);
    } catch (error) {
      console.error("Error in sending message:", error);
      setIsTyping(false);
    }
  };

  // Envia el mensaje cuando apreto enter en el textarea
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div className="chat-container">
      <div className="logo-container">
        <img src="https://www.soluciones-salud.com/wp-content/uploads/2023/07/avalian_logo-color.png.webp" alt="Logo Avalian" width={200}/>
        <p style={{textAlign: 'center'}}> Proyecto de prueba - Generador de codigo: To-do list</p>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.type === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              {message.text.map((part, i) =>
                part.type === 'code' ? (
                  <CodeBlock key={i} code={part.content} language={part.language} />
                ) : (
                  <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part.content}</span>
                )
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message ai-message typing">
            <span className="typing-indicator">Escribiendo...</span>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="chat-form">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enviar un mensaje al asistente"
        />
        <button onClick={sendMessage}> Enviar </button>
      </form>

      <div style={{marginTop: '20px'}}>
        <a onClick={handleLogout} style={{cursor: 'pointer'}}> Cerrar sesión </a>
      </div>
    </div>
  );
};

export default Chat;
