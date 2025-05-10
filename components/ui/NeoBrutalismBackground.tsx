'use client'

import { ReactNode } from 'react'
import { motion, MotionProps, TargetAndTransition } from 'framer-motion'

interface DecorativeElementProps extends MotionProps {
  className: string;
}

interface NeoBrutalismBackgroundProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

const getRandomPosition = () => Math.random() * 100 - 50;

const getContinuousMotion = (): TargetAndTransition => ({
  x: [getRandomPosition(), getRandomPosition()],
  y: [getRandomPosition(), getRandomPosition()],
  transition: { repeat: Infinity, repeatType: "mirror", duration: 10, ease: "linear" }
});

const DecorativeElement = ({ className, initial, animate, whileHover }: DecorativeElementProps) => {
  const continuousMotion = getContinuousMotion();
  const combinedAnimate: TargetAndTransition = typeof animate === 'object' ? { ...(animate as TargetAndTransition), opacity: 1, ...continuousMotion } : { opacity: 1, ...continuousMotion };
  return (
    <motion.div
      className={className}
      initial={typeof initial === 'object' ? { ...initial, opacity: 1 } : initial}
      animate={combinedAnimate}
      whileHover={whileHover}
    />
  );
}

const NeoBrutalismBackground = ({ children, className = '', containerClassName = '' }: NeoBrutalismBackgroundProps) => {
  return (
    <main className={`flex h-screen w-full items-center justify-center overflow-hidden ${className}`}>
      <div className={`h-full w-full bg-white bg-grid-black/[0.2] relative flex items-center justify-center ${containerClassName}`}>
        {/* Neobrutalism decorative elements */}
        <DecorativeElement
          className="absolute top-20 left-20 w-40 h-40 bg-yellow-300 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: -12, x: getRandomPosition(), y: getRandomPosition() }}
          animate={{ opacity: 1, rotate: -12, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute bottom-40 left-40 w-24 h-24 bg-pink-400 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, x: getRandomPosition(), y: getRandomPosition() }}
          animate={{ opacity: 1, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.1, y: -10 }}
        />
        <DecorativeElement
          className="absolute top-40 right-32 w-40 h-20 bg-blue-400 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: 12, x: getRandomPosition(), y: getRandomPosition() }}
          animate={{ opacity: 1, rotate: 12, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute bottom-32 right-48 w-28 h-28 bg-green-400 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: -6, x: getRandomPosition(), y: getRandomPosition() }}
          animate={{ opacity: 1, rotate: -6, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.1, rotate: 6 }}
        />
        <DecorativeElement
          className="absolute top-10 left-10 w-16 h-16 bg-gray-400 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: 15, x: getRandomPosition(), y: getRandomPosition() }}
          animate={{ opacity: 1, rotate: 15, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute top-1/2 left-1/4 w-20 h-20 bg-blue-500 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: -10, x: getRandomPosition(), y: getRandomPosition() }}
          animate={{ opacity: 1, rotate: -10, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute bottom-1/2 right-1/4 w-14 h-14 bg-green-500 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: 10, x: getRandomPosition(), y: getRandomPosition() }}
          animate={{ opacity: 1, rotate: 10, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute top-1/3 left-1/4 w-16 h-16 bg-yellow-400 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: -15, x: getRandomPosition(), y: getRandomPosition() }}
          animate={{ opacity: 1, rotate: -15, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute bottom-1/3 right-1/4 w-18 h-18 bg-red-400 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: 15, x: getRandomPosition(), y: getRandomPosition() }}
          animate={{ opacity: 1, rotate: 15, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-purple-300 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: -10, x: getRandomPosition(), y: getRandomPosition() }}
          animate={{ opacity: 1, rotate: -10, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute bottom-0 left-1/3 transform -translate-x-1/2 w-48 h-48 bg-orange-300 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: 10, x: getRandomPosition(), y: getRandomPosition() }}
          animate={{ opacity: 1, rotate: 10, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute top-1/4 left-1/3 w-12 h-12 bg-purple-400 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.2, rotate: 180 }}
        />
        <DecorativeElement
          className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-red-500 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: 45, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 45, scale: 1, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.2, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute top-1/3 right-1/4 w-10 h-10 bg-yellow-500 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.2, rotate: 90 }}
        />
        <DecorativeElement
          className="absolute top-1/2 left-1/3 w-8 h-8 bg-pink-500 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.2, rotate: 180 }}
        />
        <DecorativeElement
          className="absolute bottom-1/2 right-1/3 w-10 h-10 bg-yellow-600 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: 45, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 45, scale: 1, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.2, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute top-1/4 left-1/4 w-10 h-10 bg-blue-600 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: 30, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 30, scale: 1, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.2, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-green-600 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: -30, scale: 0.5 }}
          animate={{ opacity: 1, rotate: -30, scale: 1, x: getRandomPosition(), y: getRandomPosition() }}
          whileHover={{ scale: 1.2, rotate: 0 }}
        />
        
        {/* Content */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {children}
        </motion.div>
      </div>
    </main>
  )
}

export default NeoBrutalismBackground