import type { PointerEvent, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionStyle } from 'framer-motion';

const canTilt = () => typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Real 3D: the element leans toward the mouse with perspective. Off on touch screens and for reduced-motion users. */
export function Tilt({ children, className = '', max = 6, style }: { children: ReactNode; className?: string; max?: number; style?: MotionStyle }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), spring);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), spring);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !canTilt()) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div onPointerMove={move} onPointerLeave={reset} className={className}
      style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: 'preserve-3d', ...style }}>
      {children}
    </motion.div>
  );
}
