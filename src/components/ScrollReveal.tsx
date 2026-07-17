import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  id?: string;
  key?: React.Key;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  distance = 25,
  className = '',
  id
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Elegant, native high-performance Intersection Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once the section reveals, we unobserve to keep the page smooth and performant
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      {
        threshold: 0.05, // trigger when at least 5% is visible for responsive loading
        rootMargin: '0px 0px -60px 0px', // slight negative offset so it reveals exactly as it scrolls in
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  const getVariants = () => {
    const getInitialX = () => {
      if (direction === 'left') return distance;
      if (direction === 'right') return -distance;
      return 0;
    };

    const getInitialY = () => {
      if (direction === 'up') return distance;
      if (direction === 'down') return -distance;
      return 0;
    };

    return {
      hidden: {
        opacity: 0,
        x: getInitialX(),
        y: getInitialY()
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1] // Out-expo custom curve for ultra-premium deceleration
        }
      }
    };
  };

  return (
    <div ref={elementRef} id={id} className={`${className} outline-none`}>
      <motion.div
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        variants={getVariants()}
      >
        {children}
      </motion.div>
    </div>
  );
}
