import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchChats,
  deleteChat,
} from "../../services/api";
import VoiceInputChat from "../VoiceInput/VoiceInput";
import VoiceAnimation from "../VoiceAnimation/VoiceAnimation";
import PlayIcon from "../../assets/play.png";
import StopIcon from "../../assets/stop.png";
import "./Chat.css";

const Chat = () => {
  const { chatId } = useParams();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isToggled, setIsToggled] = useState(false); // Guardar conversación
  const [isToggledSinceridad, setIsToggledSinceridad] = useState(false);

  const [isConversationActive, setIsConversationActive] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  // -----------------------------------------------------------------------------
  // Función para traer threads del backend y actualizar `messages`.
  // -----------------------------------------------------------------------------
  const loadChatFromBackend = async () => {
    try {
      const data = await fetchChats();
      const allChats = data.chats || [];
      const chatSelected = allChats.find((c) => c.id === parseInt(chatId));

      if (chatSelected) {
        const { threads = [] } = chatSelected;

        if (threads.length > 0) {
          // Si ya hay threads, asumimos que la conversación finalizó.
          setHasEnded(true);
          setIsConversationActive(false);
        } else {
          // No hay threads => nuevo chat (pre-conversación).
          setHasEnded(false);
          setIsConversationActive(false);
        }

        // Convertir threads -> messages para mostrarlos en la etapa final
        const chatMessages = threads
          .map((thread) => [
            { type: "user", text: [{ content: thread.userMessage }] },
            { type: "ai", text: [{ content: thread.assistantResponse }] },
          ])
          .flat();
        setMessages(chatMessages);

      } else {
        // Si no existe el chat
        setMessages([]);
        setHasEnded(false);
        setIsConversationActive(false);
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
      setMessages([]);
      setHasEnded(false);
      setIsConversationActive(false);
    }
  };

  // -----------------------------------------------------------------------------
  // Al montar o cambiar de chatId, traemos threads y decidimos si ya terminó.
  // -----------------------------------------------------------------------------
  useEffect(() => {
    loadChatFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // -----------------------------------------------------------------------------
  // INICIAR / FINALIZAR CONVERSACIÓN
  // -----------------------------------------------------------------------------
  const handleStartConversation = () => {
    setIsConversationActive(true);
    setHasEnded(false);
  };

  const handleEndConversation = async () => {
    // Finaliza la conversación
    setIsConversationActive(false);
    setHasEnded(true);

    if (!isToggled) {
      console.log("Entra aca", isToggled)
      // Si NO está activado "Guardar conversación", borramos el chat
      try {
        await deleteChat(chatId);
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    }
    // Volvemos a consultar el estado del chat (por si se borró o guardó)
    // await loadChatFromBackend();
  };

  // -----------------------------------------------------------------------------
  // Enviar mensaje y reproducir respuesta en audio
  // -----------------------------------------------------------------------------
  const sendMessageWithAudioStream = async () => {
    if (!chatId || inputValue.trim() === "") return;

    // Añadimos mensaje del user (aunque no se muestre en "activo")
    setMessages((prev) => [
      ...prev,
      { type: "user", text: [{ content: inputValue }] },
    ]);

    const userQuestion = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5001/chat/audio-eleven", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          question: userQuestion,
          chatId: Number(chatId), // Convertimos a número
          saveThread: isToggled,
        }),
      });

      if (!response.body) {
        throw new Error("No se recibió respuesta del servidor.");
      }

      // Leer el texto de la IA desde la cabecera
      const aiText = response.headers.get("X-Text-Response");
      if (aiText) {
        setMessages((prev) => [
          ...prev,
          { type: "ai", text: [{ content: aiText }] },
        ]);
      }

      // Streaming de audio
      const mediaSource = new MediaSource();
      const audio = new Audio();
      audio.src = URL.createObjectURL(mediaSource);
      audio.play();

      mediaSource.addEventListener("sourceopen", async () => {
        const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
        const reader = response.body.getReader();
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          if (value) {
            await new Promise((resolve) => {
              const onUpdateEnd = () => {
                sourceBuffer.removeEventListener("updateend", onUpdateEnd);
                resolve();
              };
              sourceBuffer.addEventListener("updateend", onUpdateEnd);
              sourceBuffer.appendBuffer(value);
            });
          }
          done = readerDone;
        }

        sourceBuffer.addEventListener("updateend", () => {
          if (mediaSource.readyState === "open") {
            mediaSource.endOfStream();
          }
        });
      });

      setIsTyping(false);
    } catch (error) {
      console.error("Error en streaming de audio:", error);
      setIsTyping(false);
    }
  };

  // -----------------------------------------------------------------------------
  // Toggles
  // -----------------------------------------------------------------------------
  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  const handleToggleSinceridad = () => {
    setIsToggledSinceridad(!isToggledSinceridad);
  };

  // -----------------------------------------------------------------------------
  // Manejar input proveniente de VoiceInputChat
  // -----------------------------------------------------------------------------
  const handleInputChange = (value) => {
    setInputValue(value);
  };

  // -----------------------------------------------------------------------------
  // RENDER: 3 ETAPAS
  // -----------------------------------------------------------------------------
  // 1) PRE-CONVERSACIÓN: (!isConversationActive && !hasEnded)
  // 2) CONVERSACIÓN ACTIVA: (isConversationActive && !hasEnded)
  // 3) CONVERSACIÓN FINALIZADA: (!isConversationActive && hasEnded)

  // 1) PRE-CONVERSACIÓN
  if (!isConversationActive && !hasEnded) {
    return (
      <div className="chat-container pre-chat-container">
        <button className="start-chat-btn" onClick={handleStartConversation}>
          <img src={PlayIcon} alt="Play Icon" />
          Comenzar conversación
        </button>
        <div className="toggles-container">
          <div className="toggle-container">
            <span className="toggle-label">Guardar conversación</span>
            <div
              className={`toggle-switch ${isToggled ? "active" : ""}`}
              onClick={handleToggle}
            >
              <div className="toggle-knob" />
            </div>
          </div>

          {/* <div className="toggle-container">
            <span className="toggle-label">Sinceridad</span>
            <div
              className={`toggle-switch ${isToggledSinceridad ? "active" : ""}`}
              onClick={handleToggleSinceridad}
            >
              <div className="toggle-knob" />
            </div>
          </div> */}
        </div>
      </div>
    );
  }

  // 2) CONVERSACIÓN ACTIVA
  if (isConversationActive && !hasEnded) {
    return (
      <div className="chat-container">
        <div className="chat-messages">
          <VoiceAnimation isActive={isTyping} />
        </div>

        <VoiceInputChat
          setInputValue={handleInputChange}
          sendMessage={sendMessageWithAudioStream}
        />

        <button className="end-chat-btn" onClick={handleEndConversation}>
          <img src={StopIcon} alt="Stop icon" />
          Finalizar conversación
        </button>
      </div>
    );
  }

  // 3) CONVERSACIÓN FINALIZADA
  return (
    <div className="post-chat-container">
      {messages.length === 0 ? (
        <div className="chat-messages-not-saved">
          <h2>Conversación finalizada</h2>
          <p>No hay mensajes guardados.</p>
          <button
            onClick={() => (window.location.href = "/chats")}
            className="go-back-btn"
          >
            Cerrar conversación
          </button>
        </div>
      ) : (
        <div className="chat-messages">
          <h2>Conversación guardada </h2>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.type === "user" ? "user-message" : "ai-message"
                }`}
            >
              <div className="message-content">
                {message.text.map((part, i) => (
                  <span key={i} style={{ whiteSpace: "pre-wrap" }}>
                    {part.content}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chat;
