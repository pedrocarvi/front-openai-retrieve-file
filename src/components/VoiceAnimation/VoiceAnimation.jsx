
import React from "react";
import "./VoiceAnimation.css";

export default function VoiceAnimation({ isActive }) {
  return (
    <div className="voice-animation-container">
      {/* Base circle, always visible */}
      <div className="voice-circle-base" />

      {/* Animated waves when active */}
      {isActive && (
        <>
          <div className="voice-wave voice-wave1" />
          <div className="voice-wave voice-wave2" />
          <div className="voice-wave voice-wave3" />
          <div className="voice-wave voice-wave4" />
        </>
      )}
    </div>
  );
}

