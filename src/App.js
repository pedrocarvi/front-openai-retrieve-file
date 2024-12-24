import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
// Páginas
import Login from "./Pages/Login/Login";
import NotFound from "./Pages/NotFound/NotFound";
// Componentes de Chat
import ChatLayout from "./Pages/ChatLayout/ChatLayout";
import Chat from "./components/Chat/Chat";
import Informacion from "./Pages/Informacion/Informacion";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Ruta pública -> Login */}
        <Route path="/" element={<Login />} />

        <Route path="/informacion" element={<Informacion/>}/>

        {/* Rutas protegidas */}
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        >
          {/* Dentro de /chats, 
              se renderiza Chat cuando /chats/:chatId */}
          <Route path=":chatId" element={<Chat />} />

          {/* 
            Si deseas manejar un caso default (por ej. /chats sin :chatId),
            puedes agregar algo como:
            <Route index element={<NoChatSelected />} />
            o similar.
          */}
        </Route>

        {/* Ruta NotFound para cualquier path no definido */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;