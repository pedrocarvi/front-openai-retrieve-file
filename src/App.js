// Ruteo
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
// Componentes
import Login from './Pages/Login/Login';
import Chat from './components/Chat/Chat';
import NotFound from './Pages/NotFound/NotFound';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Ruta pública */}
        <Route path='/' element={<Login/>}/>
        {/* Ruta privada  */}
        <Route
          path='/chat'
          element={
            <ProtectedRoute>
              <Chat/>
            </ProtectedRoute>
          }
        />
        {/* Ruta error */}
        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </div>
  );
}

export default App;
