'use client';

import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

type Props = {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'zoom';
};

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
}: Props) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  const getVariants = () => {
    const base = { opacity: 0, scale: 0.95 };
    switch (direction) {
      case 'up':
        return { ...base, y: 40 };
      case 'down':
        return { ...base, y: -40 };
      case 'left':
        return { ...base, x: -40 };
      case 'right':
        return { ...base, x: 40 };
      case 'zoom':
        return { ...base, scale: 0.85 };
      default:
        return base;
    }
  };

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.7,
          delay,
          ease: [0.22, 1, 0.36, 1],
        },
      });
    } else {
      controls.start(getVariants());
    }
  }, [controls, inView, delay]);

  return (
    <motion.div
      ref={ref}
      initial={getVariants()}
      animate={controls}
    >
      {children}
    </motion.div>
  );
}
