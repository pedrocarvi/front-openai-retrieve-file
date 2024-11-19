import React from "react";
import { useState } from "react";
// css
import './login.css';
// Assets
// Funciones
import { useNavigate } from "react-router-dom";
import apiClient from "../../axiosConfig";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    // TODO: Agregar un loader
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/login', { email, password });
            console.log(response);
            localStorage.setItem('token', response.data.token);
            navigate('/chat');
            setMessage('Inicio de sesión exitoso. Token almacenado.');
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error al iniciar sesión');
        }
    };

    return (
        <div>
            <div className="login-subcontainer">
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