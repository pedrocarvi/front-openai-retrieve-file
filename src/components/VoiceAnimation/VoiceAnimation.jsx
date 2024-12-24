import { useEffect, useRef } from "react";
import "./VoiceAnimation.css";

export default function VoiceAnimation({ isActive }) {
  const canvasRef = useRef(null);
  let animationFrameId;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles = [];
    const particleCount = 12;
    const colors = ["#15A9BB", "#21B8D2", "#158fbb"]; // Colores voz

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      constructor() {
        this.init();
      }

      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseSize = Math.random() * 5 + 1; // Tamaño base más pequeño
        this.size = this.baseSize;
        this.baseSpeedX = Math.random() * 0.5 - 0.25; // Velocidad lenta por defecto
        this.baseSpeedY = Math.random() * 0.5 - 0.25;
        this.activeSpeedX = Math.random() * 2 - 1.5; // Velocidad rápida cuando está activo
        this.activeSpeedY = Math.random() * 2 - 1.5;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.speedX = isActive ? this.activeSpeedX : this.baseSpeedX;
        this.speedY = isActive ? this.activeSpeedY : this.baseSpeedY;

        this.x += this.speedX;
        this.y += this.speedY;

        if (this.size > 0.2 && isActive) {
          this.size -= 0.1;
        } else {
          this.size = this.baseSize; // Tamaño original cuando no está activo
        }

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initParticles() {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.update();
        particle.draw();

        if (particle.size <= 0.2 && isActive) {
          particles.splice(index, 1);
          particles.push(new Particle());
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isActive]); // Dependemos de `isActive`

  return (
    <div className="relative h-20 w-20"> {/* Tamaño reducido */}
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 h-full w-full"
      />
    </div>
  );
}
