import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  winnerSymbol: 'X' | 'O';
}

export const Confetti: React.FC<ConfettiProps> = ({ winnerSymbol }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    const colors = winnerSymbol === 'X'
      ? ['#00F0FF', '#38BDF8', '#0284C7', '#A5F3FC', '#FFFFFF']
      : ['#FF2E84', '#F43F5E', '#BE123C', '#FECDD3', '#FFFFFF'];

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      vx: number;
      vy: number;
      angle: number;
      angularSpeed: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const count = 65;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 80,
        y: canvas.height * 0.45,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 11 - 4,
        angle: Math.random() * 360,
        angularSpeed: (Math.random() - 0.5) * 15,
        opacity: 1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let anyAlive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32; // gravity
        p.vx *= 0.98; // air resistance
        p.angle += p.angularSpeed;
        p.opacity = Math.max(0, p.opacity - 0.009);

        if (p.opacity > 0) {
          anyAlive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.angle * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      });

      if (anyAlive) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [winnerSymbol]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
    />
  );
};
