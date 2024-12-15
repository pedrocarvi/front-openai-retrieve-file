import React, { useState, useRef } from 'react';
import './voiceInput.css';

const VoiceInputChat = ({ setInputValue, sendMessage }) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    const startListening = () => {
        if (isListening) return;

        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
            alert("El reconocimiento de voz no es compatible con este navegador.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = "es-ES";
        recognitionRef.current.interimResults = true;
        recognitionRef.current.continuous = true;

        recognitionRef.current.start();
        setIsListening(true);

        recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0].transcript)
                .join("");
            setInputValue(transcript);
            // console.log("Texto reconocido:", transcript)
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
            console.log("Reconocimiento de voz terminado.");
            // Llama a sendMessage cuando se detiene el reconocimiento
            sendMessage();
        };
        
        recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            alert("Error en el reconocimiento de voz: " + event.error);
            setIsListening(false);
        };
    };

    const stopListening = () => {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
        setIsListening(false);
    };

    return (
        <div className="voice-input-container">
            <button 
                className={`voice-input-btn ${isListening ? 'listening' : ''}`} 
                onClick={isListening ? stopListening : startListening}
            >
                {isListening ? 'Detener' : 'Hablar'}
            </button>
        </div>
    );
};

export default VoiceInputChat;
