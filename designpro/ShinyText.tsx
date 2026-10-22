import { motion, useReducedMotion } from 'framer-motion';

interface ShinyTextProps {
  text: string;
  className?: string;
  color?: string;
  shineColor?: string;
  speed?: number;
  spread?: number;
  paused?: boolean;
}

/** Moving from 100% to 0% carries the highlight from left to right. */
export function ShinyText({ text, className = '', color = '#64CEFB', shineColor = '#ffffff', speed = 3, spread = 100, paused = false }: ShinyTextProps) {
  const reducedMotion = useReducedMotion();
  const still = reducedMotion || paused;
  return (
    <motion.span
      className={`shiny-text ${className}`}
      style={{
        backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 40%, ${shineColor} 50%, ${color} 60%, ${color} 100%)`,
        backgroundSize: '250% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      }}
      initial={{ backgroundPosition: '100% 50%' }}
      animate={{ backgroundPosition: still ? '100% 50%' : ['100% 50%', '0% 50%'] }}
      transition={still ? { duration: 0 } : { duration: Math.max(0.1, speed), repeat: Infinity, ease: 'linear' }}
    >{text}</motion.span>
  );
}
