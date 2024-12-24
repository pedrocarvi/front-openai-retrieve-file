import React from "react";
import { useState } from "react";
// css
import './login.css';
// Assets
// Funciones
import { useNavigate } from "react-router-dom";
import apiClient from "../../axiosConfig";
import LoaderAllScreen from "../../components/LoaderAllScreen/LoaderAllScreen";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loadingAllScreen, setLoadingAllScreen] = useState(false);

    // TODO: Agregar un loader
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingAllScreen(true);
        try {
            const response = await apiClient.post('/login', { email, password });
            localStorage.setItem('token', response.data.token);
            setLoadingAllScreen(false);
            navigate('/chats');
            setMessage('Inicio de sesión exitoso. Token almacenado.');
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error al iniciar sesión');
            setLoadingAllScreen(false);
        }
    };

    return (
        <div>
            { loadingAllScreen ? <LoaderAllScreen/> : ''}
            <div className="login-subcontainer">
                <h1> numa. </h1>
                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Iniciar sesión</button>
                        {message && <p>{message}</p>}
                    </form>
                </div>
            </div>

        </div>
    );
};

export default Login;