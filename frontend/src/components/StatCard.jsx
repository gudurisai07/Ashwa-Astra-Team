import { useEffect, useRef, useState } from 'react';

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (target == null || typeof target !== 'number') {
      setCount(target);
      return;
    }
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return count;
}

const toneConfig = {
  blue:   { border: 'rgba(56, 189, 248, 0.35)',   glow: 'rgba(56, 189, 248, 0.15)',  text: '#38bdf8',  bg: 'rgba(56, 189, 248, 0.08)'  },
  amber:  { border: 'rgba(251, 191, 36, 0.35)',   glow: 'rgba(251, 191, 36, 0.12)', text: '#fbbf24',  bg: 'rgba(251, 191, 36, 0.07)'  },
  green:  { border: 'rgba(34, 197, 94, 0.35)',    glow: 'rgba(34, 197, 94, 0.12)',  text: '#4ade80',  bg: 'rgba(34, 197, 94, 0.07)'   },
  violet: { border: 'rgba(168, 85, 247, 0.35)',   glow: 'rgba(168, 85, 247, 0.15)', text: '#c084fc',  bg: 'rgba(168, 85, 247, 0.08)'  },
  red:    { border: 'rgba(239, 68, 68, 0.35)',    glow: 'rgba(239, 68, 68, 0.12)',  text: '#f87171',  bg: 'rgba(239, 68, 68, 0.07)'   },
};

export default function StatCard({ label, value, tone = 'blue', hint }) {
  const animated = useCountUp(typeof value === 'number' ? value : null);
  const cfg = toneConfig[tone] || toneConfig.blue;
  const display = typeof value === 'number' ? animated : (value ?? '—');

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${cfg.bg}, rgba(15,23,42,0.6))`,
        border: `1px solid ${cfg.border}`,
        borderRadius: '1.1rem',
        padding: '1.4rem 1.6rem',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: `0 4px 24px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 8px 32px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 4px 24px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`;
      }}
    >
      {/* Gradient orb accent */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '70px', height: '70px', borderRadius: '50%',
        background: cfg.glow, filter: 'blur(20px)', pointerEvents: 'none'
      }} />

      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '2.4rem', fontWeight: 800, color: cfg.text, lineHeight: 1, letterSpacing: '-0.02em' }}>
        {display}
      </div>
      {hint && (
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
          {hint}
        </div>
      )}
    </div>
  );
}
