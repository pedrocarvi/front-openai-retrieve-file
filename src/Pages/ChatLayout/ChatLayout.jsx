import React from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "./ChatLayout.css"; // Si quieres estilos propios

const ChatLayout = () => {
  return (
    <div className="chat-layout-container">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Outlet: aquí se renderizarán las rutas hijas, 
          en este caso, /chats/:chatId -> <Chat /> */}
      <div className="chat-layout-main">
        <Outlet />
      </div>
    </div>
  );
};

export default ChatLayout;
