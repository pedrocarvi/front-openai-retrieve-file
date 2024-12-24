import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Informacion.css';
import SpeakImg from "../../assets/speak.png";
import ReadingBookImg from "../../assets/reading-book.png";
import SesionesImg from '../../assets/sesiones.png'

const Inicio = () => {
    return (

        <div className="chat-layout-container">
            {/* Sidebar fijo */}
            <Sidebar />

            <div className="chat-layout-main">
                <div className="inicio-bienvenida">
                    <h2> Bienvenido </h2>
                    <p > En nuestra plataforma, nuestro objetivo es que <b> nunca te sientas solo. </b>  Aquí puedes hablar libremente sobre tus pensamientos, emociones o preocupaciones, sabiendo que del otro lado encontrarás empatía, comprensión y la capacidad para ayudarte a resolver problemas. Ya sea con un terapeuta IA o con la sabiduría de personajes históricos, siempre tendrás alguien con quien hablar.</p>
                </div>
                {/* <div className="inicio-accesos">
                    <h2> Accesos </h2>
                    <div className="inicio-accesos-list">
                        <div className="inicio-accesos-item">
                            <img src={SpeakImg} alt="Speak img" width={120} />
                            <div className="inicio-accesos-item-text">
                                <p> Nueva sesión </p>
                            </div>
                        </div>
                        <div className="inicio-accesos-item">
                            <img src={SesionesImg} alt="Sesiones img" width={120} />
                            <div className="inicio-accesos-item-text">
                                <p> Historial de sesiones </p>
                            </div>
                        </div>
                        <div className="inicio-accesos-item">
                            <img src={ReadingBookImg} alt="Reading book" width={120} />
                            <div className="inicio-accesos-item-text">
                                <p> Ver modelos </p>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    )
}

export default Inicio;