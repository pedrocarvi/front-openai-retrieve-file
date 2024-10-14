import React, { useState } from "react";
import "./Chat.css";
import { sendMessageToAssistant } from "../../services/api";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (inputValue.trim() === "") return;

    setMessages([...messages, { type: "user", text: inputValue }]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await sendMessageToAssistant(inputValue);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "ai", text: response.response },
      ]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error in sending message:", error);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <span>{message.text}</span>
          </div>
        ))}

        {isTyping && (
          <div className="message ai">
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
      </form>
    </div>
  );
};

export default Chat;
