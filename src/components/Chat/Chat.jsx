import React, { useEffect, useState } from "react";
import "./Chat.css";
import { sendMessageToAssistant, fetchChats, startNewChat, deleteChat } from "../../services/api";
import CodeBlock from "../CodeBlock/Codeblock";
import { useNavigate } from "react-router-dom";
import TrashIcon from '../../assets/trash.png';
import LoaderAllScreen from "../LoaderAllScreen/LoaderAllScreen";
import Loader from "../Loader/Loader";
import VoiceInputChat from "../VoiceInput/VoiceInput";
import VoiceAnimation from "../VoiceAnimation/VoiceAnimation";

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAllScreen, setLoadingAllScreen] = useState(false);
  const [isToggled, setIsToggled] = useState(false);

  // ******************************************************************************************
  // Imprimo el chat seleccionado - Hay un problema que no toma bien el chat cuando se crea uno nuevo
  // ******************************************************************************************
  useEffect(() => {
    if (currentChat) {
      console.log("Chat actual seleccionado:", currentChat);
    }
  }, [currentChat]);

  // ******************************************************************************************
  // Me traigo los chats pasados del usuario
  // ******************************************************************************************
  useEffect(() => {
    const getChats = async () => {
      setLoading(true);
      try {
        const chatsData = await fetchChats();
        setChatSessions(chatsData.chats);
        setLoading(false);

        if (chatsData.chats.length > 0) {
          // Hace que el chat por defecto sea el mas nuevo
          handleChatSelection(chatsData.chats[chatsData.chats.length - 1]);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
        setLoading(false);
      }
    };
    getChats();
  }, []);
  
  // ******************************************************************************************
  // Selecciono chat pasado 
  // ******************************************************************************************
  const handleChatSelection = async (chat) => {
    if (!chat) {
      console.error("Selected chat is undefined or null");
      return;
    }
  
    setCurrentChat(chat);
  
    // Trae el thread / mensajes del chat
    if (chat.threads && chat.threads.length > 0) {
      const chatMessages = chat.threads.map((thread) => [
        { type: "user", text: [{ type: "text", content: thread.userMessage }] },
        { type: "ai", text: parseMessageContent(thread.assistantResponse) }
      ]).flat();
      setMessages(chatMessages);
    } else {
      // Si no trae los threads/mensajes, hace una nueva llamada x las dudas y sino deja la seccion de mensajes vacia.
      try {
        setLoading(true);
        const chatsData = await fetchChats();
        
        // Find the specific chat that was selected
        const updatedChat = chatsData.chats.find(c => c.id === chat.id);
        
        if (updatedChat && updatedChat.threads && updatedChat.threads.length > 0) {
          const chatMessages = updatedChat.threads.map((thread) => [
            { type: "user", text: [{ type: "text", content: thread.userMessage }] },
            { type: "ai", text: parseMessageContent(thread.assistantResponse) }
          ]).flat();
          setMessages(chatMessages);
        } else {
          setMessages([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error refetching chats:", error);
        setMessages([]);
        setLoading(false);
      }
    }
  };

  // ******************************************************************************************
  // Comienza un nuevo chat
  // ******************************************************************************************
  const handleStartNewChat = async () => {
    setLoading(true);
    try {
      const newChat = await startNewChat();
      setChatSessions((prevSessions) => [...prevSessions, newChat.newChat]);
      setMessages([]);
      
      setCurrentChat(newChat.newChat, () => {
        console.log("Nuevo chat seleccionado:", newChat.newChat);
      });
  
      setLoading(false); 
    } catch (error) {
      console.error("Error starting new chat:", error);
      setLoading(false);
    }
  };
  
  // ******************************************************************************************
  // Para las respuestas que tienen codigo, Transforma el texto en codigo - EN DESUSO
  // ******************************************************************************************
  function parseMessageContent(text) {
    const regex = /```(\w+)?\n([\s\S]*?)```/g; 
    const parts = [];
    let lastIndex = 0;
    let match;

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

  // ******************************************************************************************
  // Envia prompt en formato texto - EN DESUSO
  // ******************************************************************************************
  // const sendMessage = async () => {
  //   if (inputValue.trim() === "" || !currentChat) {
  //     console.error("No current chat or empty input value.");
  //     return;
  //   }
  
  //   setMessages([
  //       ...messages,
  //       { type: "user", text: [{ type: "text", content: inputValue }] },
  //   ]);
  //   setInputValue("");
  //   setIsTyping(true);
  
  //   try {
  //       const response = await sendMessageToAssistant(inputValue, currentChat.id, isToggled);
  //       setMessages((prevMessages) => [
  //           ...prevMessages,
  //           { type: "ai", text: parseMessageContent(response.response) },
  //       ]);
  //       setIsTyping(false);
  //   } catch (error) {
  //       console.error("Error in sending message:", error);
  //       setIsTyping(false);
  //   }
  // };

  // ******************************************************************************************
  // Envia prompt en audio y texto
  // ******************************************************************************************
  const sendMessage = async () => {
    if (!currentChat || inputValue.trim() === "") return;
  
    setMessages([
      ...messages,
      { type: "user", text: [{ type: "text", content: inputValue }] },
    ]);
    setInputValue("");
    setIsTyping(true);
  
    try {
      const response = await sendMessageToAssistant(inputValue, currentChat.id, isToggled);
      const aiResponse = response.response;  // La respuesta de la IA
  
      // Mostrar la respuesta en el chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "ai", text: parseMessageContent(aiResponse) },
      ]);
  
      // Convertir la respuesta de la IA a audio usando ElevenLabs
      // await speakTextWithElevenLabs(aiResponse);
  
      setIsTyping(false);
    } catch (error) {
      console.error("Error in sending message:", error);
      setIsTyping(false);
    }
  };  
  
  // ******************************************************************************************
  // Envia prompt al hacer enter - EN DESUSO
  // ******************************************************************************************  
  // const handleKeyDown = (event) => {
  //   if (event.key === "Enter" && !event.shiftKey) {
  //     event.preventDefault();
  //     sendMessage(event);
  //   }
  // };

  // ******************************************************************************************
  // Manejo el audio que me llega del componente VoiceInputChat - capta y setea el valor del audio en texto
  // ******************************************************************************************
  const handleInputChange = (value) => {
    // console.log("Valor actualizado:", value); 
    setInputValue(value);
  };

  // ******************************************************************************************
  // Si el toggle esta activado, guardo el chat, sino no.
  // ******************************************************************************************
  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  // ******************************************************************************************
  // Elimino un chat
  // ******************************************************************************************  
  const handleDelete = async (chatId) => {
    if (chatId) {
      setLoadingAllScreen(true)
      try {
        await deleteChat(chatId); 
        // Filtra el chat eliminado de la lista de chats
        setChatSessions((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

        // Si el chat eliminado era el actual, limpia los mensajes
        if (currentChat?.id === chatId) {
          setCurrentChat(null);
          setMessages([]);
        }

        setLoadingAllScreen(false);
      } catch (error) {
        console.error("Error al eliminar conversación:", error);
        setLoadingAllScreen(false);
      }
    } else {
      console.log("El chat no tenía ID válido");
      setLoadingAllScreen(false);
    }
  };

  // ******************************************************************************************
  // Enviar mensaje y reproducir respuesta en audio
  // ******************************************************************************************
  const sendMessageWithAudioStream = async () => {
    if (!currentChat || inputValue.trim() === "") return;
  
    setMessages([
      ...messages,
      { type: "user", text: [{ type: "text", content: inputValue }] },
    ]);
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
          question: inputValue,
          chatId: currentChat.id,
        }),
      });
  
      if (!response.body) {
        throw new Error("No se recibió respuesta del servidor.");
      }
  
      // Configuración de MediaSource para streaming de audio
      const mediaSource = new MediaSource();
      const audio = new Audio();
      audio.src = URL.createObjectURL(mediaSource);
      audio.play();
  
      mediaSource.addEventListener("sourceopen", async () => {
        const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
  
        const reader = response.body.getReader();
        let done = false;
  
        // Agregar los chunks de audio al SourceBuffer
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          if (value) {
            // Esperar a que SourceBuffer termine de actualizar
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
  
        // Llamar a endOfStream después de que se hayan procesado todos los datos
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
  
  // ******************************************************************************************
  // Logout del usuario
  // ****************************************************************************************** 
  const handleLogout = () => {
    setLoadingAllScreen(true);
    localStorage.removeItem("token");
    setLoadingAllScreen(false);
    navigate("/");
  };

  // ******************************************************************************************
  // FRONT
  // ******************************************************************************************
  return (
    <div className="chat-container">
      {loadingAllScreen ? <LoaderAllScreen/> : ''}
      <div className="chat-sidebar">
        <div className="logo-container">
          <h1> numa. </h1>
          {/* <img
            src="https://www.soluciones-salud.com/wp-content/uploads/2023/07/avalian_logo-color.png.webp"
            alt="Logo Avalian"
            width={150}
          />
          <p style={{ textAlign: "center" }}> Generador de codigo: To-do list</p> */}
        </div>
        <div className="new-chat-container">
          <button onClick={handleStartNewChat} className="new-chat-btn"> Nuevo chat </button>
        </div>
        <div className="chats-container">
          <span> Chats anteriores </span>
          {
          loading ? 
            <div className="chats-loader-ctn"> <Loader/> </div> :
            <div className="chats-conversations">
              {
                chatSessions.slice().reverse().map(chat => (
                  <div key={chat.id} className="chat-conversation">
                    <button
                      key={chat.id}
                      onClick={() => handleChatSelection(chat)}
                      className={currentChat && currentChat.id === chat.id ? 'active' : ''}
                    >
                      {chat.name}
                    </button>
                    <a onClick={() => handleDelete(chat.id)}>
                      <img src={TrashIcon} alt="Icono delete" width={20} />
                    </a>
                </div>
              ))
            }
          </div>
          }
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-footer-el">
            <a> Dar feedback </a>
          </div>
          <div className="sidebar-footer-el">
            <a onClick={handleLogout} > Cerrar sesión </a>
          </div>
        </div>
      </div>
      <div className="chat-area">
        <div className="chat-messages">
          {/* {messages.map((message, index) => (
            <div key={index} className={`message ${message.type === 'user' ? 'user-message' : 'ai-message'}`}>
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
          ))} */}
          <div className="chat-messages">
            <VoiceAnimation isActive={isTyping} />
          </div>
        </div>

        <VoiceInputChat setInputValue={handleInputChange} sendMessage={sendMessageWithAudioStream} />

        <div className="toggle-container">
          <span className="toggle-label"> Guardar conversación </span>
          <div  className={`toggle-switch ${isToggled ? 'active' : ''}`}  onClick={handleToggle}>
            <div className="toggle-knob"></div>
          </div>
        </div>

        {/* Como se enviaba la prompt en formato texto antes  */}
        {/* <form onSubmit={sendMessage} className="chat-form">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enviar un mensaje al asistente"
          />
          <button onClick={sendMessage} disabled={!currentChat}> Enviar </button>
        </form> */}        
      </div>
    </div>
  );
};

export default Chat;