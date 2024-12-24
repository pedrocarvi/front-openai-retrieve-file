import React, { useEffect, useState } from "react";
import { fetchChats, startNewChat, deleteChat } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import LoaderAllScreen from "../LoaderAllScreen/LoaderAllScreen";
import TrashIcon from "../../assets/trash.png";
import InfoIcon from "../../assets/info-circle.png";
import ModelosIcon from "../../assets/voice-square2.png";
import FeedbackIcon from "../../assets/feedback2.png";
import LogoutIcon from "../../assets/logout.png";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAllScreen, setLoadingAllScreen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // Estado para el modal

  useEffect(() => {
    const getChats = async () => {
      setLoading(true);
      try {
        const chatsData = await fetchChats(); // Devuelve { chats: [...] }
        setChatSessions(chatsData.chats);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chats:", error);
        setLoading(false);
      }
    };
    getChats();
  }, []);

  const handleStartNewChat = async () => {
    setLoading(true);
    try {
      const newChat = await startNewChat();
      const chatCreated = newChat.newChat;
      setChatSessions((prev) => [...prev, chatCreated]);

      navigate(`/chats/${chatCreated.id}`);
      setLoading(false);
    } catch (error) {
      console.error("Error starting new chat:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (chatId) => {
    if (!chatId) return;
    setLoadingAllScreen(true);
    try {
      await deleteChat(chatId);
      setChatSessions((prev) => prev.filter((chat) => chat.id !== chatId));
      window.location.href = "/chats"
      setLoadingAllScreen(false);
    } catch (error) {
      console.error("Error al eliminar conversación:", error);
      setLoadingAllScreen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="sidebar-container">
      {loadingAllScreen && <LoaderAllScreen />}

      <div className="logo-container">
        <Link to="/chats">
          <h1>numa.</h1>
        </Link>
      </div>

      <div className="new-chat-container">
        <button onClick={handleStartNewChat} className="new-chat-btn">
          Nueva sesión
        </button>
      </div>

      <div className="chats-container">
        <span>Sesiones</span>

        {loading ? (
          <div className="chats-loader-ctn">
            <Loader />
          </div>
        ) : (
          <div className="chats-conversations">
            {chatSessions.length > 0 ? (
              chatSessions
                .slice()
                .reverse()
                .map((chat) => (
                  <div key={chat.id} className="chat-conversation">
                    <Link to={`/chats/${chat.id}`}>{chat.name}</Link>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(chat.id)}
                    >
                      <img src={TrashIcon} alt="Icono delete" width={20} />
                    </button>
                  </div>
                ))
            ) : (
              <p style={{ color: "rgba(0,0,0,0.5)" }}>
                Aún no tienes conversaciones.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <Link to="/informacion">
          <div className="sidebar-footer-el">
            <img src={InfoIcon} alt="Informacion icon" width={24} />
            Más información
          </div>
        </Link>
        <div className="sidebar-footer-el">
          <img src={FeedbackIcon} alt="Feedback icon" width={24} />
          <a>Dar feedback</a>
        </div>
        <div className="sidebar-footer-el">
          <img src={LogoutIcon} alt="Logout icon" width={24} />
          <a onClick={openLogoutModal}>Cerrar sesión</a>
        </div>
      </div>

      {isLogoutModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>¿Estás seguro de que deseas cerrar sesión?</h2>
            <div className="modal-actions">
            <button onClick={closeLogoutModal} className="cancel-btn">
                Cancelar
              </button>
              <button onClick={handleLogout} className="confirm-btn">
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;