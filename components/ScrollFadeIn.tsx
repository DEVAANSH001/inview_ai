'use client';

import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

type Props = {
  children: React.ReactNode;
  delay?: number;
};

export default function ScrollFadeIn({ children, delay = 0 }: Props) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: false, // Trigger on scroll up too
    threshold: 0.2, // How much of the component needs to be visible
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1], // smooth easeOutExpo-like curve
          delay,
        },
      });
    } else {
      controls.start({ opacity: 0, y: 40 });
    }
  }, [controls, inView, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
}
