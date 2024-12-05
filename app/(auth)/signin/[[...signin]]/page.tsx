'use client'

import { SignIn } from '@clerk/nextjs'
import { motion, MotionProps } from 'framer-motion'

interface DecorativeElementProps extends MotionProps {
  className: string;
}

const DecorativeElement = ({ className, initial, animate, whileHover }: DecorativeElementProps) => (
  <motion.div
    className={className}
    initial={initial}
    animate={animate}
    whileHover={whileHover}
  />
)

const SigninPage = () => {
  return (
    <main className='flex h-screen w-full items-center justify-center overflow-hidden'>
      <div className="h-full w-full bg-white bg-grid-black/[0.2] relative flex items-center justify-center">
        {/* Neobrutalism decorative elements */}
        <DecorativeElement
          className="absolute top-20 left-20 w-32 h-32 bg-yellow-300 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: -12, y: -50 }}
          animate={{ opacity: 1, rotate: -12, y: 0 }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute bottom-40 left-40 w-24 h-24 bg-pink-400 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1, y: -10 }}
        />
        <DecorativeElement
          className="absolute top-40 right-32 w-40 h-20 bg-blue-400 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: 12, y: -50 }}
          animate={{ opacity: 1, rotate: 12, y: 0 }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute bottom-32 right-48 w-28 h-28 bg-green-400 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: -6, y: 50 }}
          animate={{ opacity: 1, rotate: -6, y: 0 }}
          whileHover={{ scale: 1.1, rotate: 6 }}
        />
        
        {/* Smaller decorative elements */}
        <DecorativeElement
          className="absolute top-1/4 left-1/3 w-12 h-12 bg-purple-400 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.2, rotate: 180 }}
        />
        <DecorativeElement
          className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-red-400 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: 45, scale: 0 }}
          animate={{ opacity: 1, rotate: 45, scale: 1 }}
          whileHover={{ scale: 1.2, rotate: 0 }}
        />
        
        {/* Zigzag patterns */}
        <DecorativeElement
          className="absolute top-12 right-12 w-20 h-4 bg-orange-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: 45, x: 50 }}
          animate={{ opacity: 1, rotate: 45, x: 0 }}
          whileHover={{ scale: 1.2, rotate: 0 }}
        />
        <DecorativeElement
          className="absolute bottom-16 left-16 w-20 h-4 bg-teal-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          initial={{ opacity: 0, rotate: -45, x: -50 }}
          animate={{ opacity: 1, rotate: -45, x: 0 }}
          whileHover={{ scale: 1.2, rotate: 0 }}
        />
        
        {/* Clerk SignIn component */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SignIn />
        </motion.div>
      </div>
    </main>
  )
}

export default SigninPage

