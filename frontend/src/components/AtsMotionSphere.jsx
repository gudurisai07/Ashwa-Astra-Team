import { useEffect, useRef } from 'react';

/**
 * Interactive 3D Holographic Gyro Sphere & Particle Motion Layer.
 * Renders glowing 3D orbital rings and cosmic particles around the central ATS score.
 */
export default function AtsMotionSphere({ score = 88, max = 100, label = 'ATS Compatibility' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angleX = 0;
    let angleY = 0;
    let targetAngleX = 0;
    let targetAngleY = 0;

    // Responsive sizing
    const size = 260;
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Particle nodes for 3D sphere
    const numParticles = 45;
    const particles = [];
    const sphereRadius = 90;

    for (let i = 0; i < numParticles; i++) {
      const phi = Math.acos(-1 + (2 * i) / numParticles);
      const theta = Math.sqrt(numParticles * Math.PI) * phi;
      particles.push({
        x: sphereRadius * Math.cos(theta) * Math.sin(phi),
        y: sphereRadius * Math.sin(theta) * Math.sin(phi),
        z: sphereRadius * Math.cos(phi),
        size: Math.random() * 2 + 1,
        color: i % 2 === 0 ? '#38bdf8' : '#a855f7'
      });
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetAngleY = x * 0.8;
      targetAngleX = -y * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // Smooth rotation dampening
      angleX += (targetAngleX - angleX) * 0.05 + 0.005;
      angleY += (targetAngleY - angleY) * 0.05 + 0.008;

      const cx = size / 2;
      const cy = size / 2;

      // Draw background ambient glow
      const radial = ctx.createRadialGradient(cx, cy, 10, cx, cy, 110);
      radial.addColorStop(0, score >= 75 ? 'rgba(34, 197, 94, 0.22)' : 'rgba(168, 85, 247, 0.2)');
      radial.addColorStop(0.6, 'rgba(59, 130, 246, 0.08)');
      radial.addColorStop(1, 'transparent');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.fill();

      // Draw 3D Gyro Orbit Rings
      const drawRing = (tiltX, tiltY, strokeColor, lineWidth, radius) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.08) {
          let rx = radius * Math.cos(a);
          let ry = radius * Math.sin(a);
          let rz = 0;

          // Rotate Y
          let x1 = rx * Math.cos(angleY + tiltY) - rz * Math.sin(angleY + tiltY);
          let z1 = rx * Math.sin(angleY + tiltY) + rz * Math.cos(angleY + tiltY);

          // Rotate X
          let y2 = ry * Math.cos(angleX + tiltX) - z1 * Math.sin(angleX + tiltX);
          let z2 = ry * Math.sin(angleX + tiltX) + z1 * Math.cos(angleX + tiltX);

          const perspective = 300 / (300 + z2);
          const px = x1 * perspective;
          const py = y2 * perspective;

          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.restore();
      };

      // Outer & Inner Gyro Ring Layers
      drawRing(0.4, 0, 'rgba(168, 85, 247, 0.45)', 1.5, 96);
      drawRing(-0.6, 0.8, 'rgba(56, 189, 248, 0.5)', 1.5, 92);
      drawRing(1.1, -0.4, 'rgba(34, 197, 94, 0.4)', 1.2, 88);

      // Render 3D Floating Particles
      particles.forEach((p) => {
        // Rotate Y
        let x1 = p.x * Math.cos(angleY) - p.z * Math.sin(angleY);
        let z1 = p.x * Math.sin(angleY) + p.z * Math.cos(angleY);

        // Rotate X
        let y2 = p.y * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = p.y * Math.sin(angleX) + z1 * Math.cos(angleX);

        const perspective = 300 / (300 + z2);
        const px = cx + x1 * perspective;
        const py = cy + y2 * perspective;
        const alpha = Math.max(0.1, (z2 + sphereRadius) / (sphereRadius * 2));

        ctx.beginPath();
        ctx.arc(px, py, p.size * perspective, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [score]);

  const scoreColor = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171';

  return (
    <div
      style={{
        position: 'relative',
        width: '260px',
        height: '260px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '260px',
          height: '260px',
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: 'grab'
        }}
      />
      {/* Central Holographic Core */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            fontSize: '3.2rem',
            fontWeight: 800,
            lineHeight: 1,
            color: '#f8fafc',
            textShadow: `0 0 24px ${scoreColor}88, 0 0 40px ${scoreColor}44`,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '-0.03em'
          }}
        >
          {score}
        </div>
        <div
          style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#94a3b8',
            marginTop: '0.2rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          / {max}
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginTop: '0.45rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${scoreColor}55`,
            color: scoreColor,
            fontSize: '0.75rem',
            fontWeight: 700
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: scoreColor,
              boxShadow: `0 0 8px ${scoreColor}`
            }}
          />
          {label}
        </div>
      </div>
    </div>
  );
}
