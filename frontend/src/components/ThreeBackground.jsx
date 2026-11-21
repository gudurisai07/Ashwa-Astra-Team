import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Lightweight decorative particle field. It never captures pointer events, pauses when the tab is hidden,
 * is skipped entirely for users who prefer reduced motion or lack WebGL (the CSS gradient is the fallback).
 */
export default function ThreeBackground() {
  const mount = useRef(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return setEnabled(false);

    const el = mount.current;
    if (!el) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      setEnabled(false);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.z = 14;

    const count = 420;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 30;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x60a5fa, size: 0.07, transparent: true, opacity: 0.75 });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    let raf = 0;
    let running = true;
    const tick = () => {
      if (!running) return;
      points.rotation.y += 0.0007;
      points.rotation.x += 0.0003;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    };
    const onVisibility = () => {
      running = !document.hidden;
      if (running) tick();
      else cancelAnimationFrame(raf);
    };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mount} className="three-bg" aria-hidden="true" style={{ display: enabled ? 'block' : 'none' }} />;
}
