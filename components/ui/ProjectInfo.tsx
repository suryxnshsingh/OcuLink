'use client'
import React, { useState } from 'react'
import { Video, Zap, Users, Share2, MessageCircle, Mic, Star } from 'lucide-react'
import { motion } from 'framer-motion'

const ProjectInfo = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const technologies = [
    { name: 'Next.js', color: 'bg-black' },
    { name: 'TypeScript', color: 'bg-green-500' },
    { name: 'Tailwind CSS', color: 'bg-blue-500' },
    { name: 'Clerk', color: 'bg-purple-500' },
    { name: 'GetStream', color: 'bg-orange-500' },
    { name: 'Node Mailer', color: 'bg-yellow-500' },
    { name: 'Framer Motion', color: 'bg-red-500' },
    { name: 'shadcn UI', color: 'bg-gray-500' },
  ]

  return (
    <motion.div
      className="relative h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='pt-5 rounded-xl h-full'>
        <div className='mb-6 relative z-10'>
          <h3 className='text-xl font-bold mb-2 text-center'>OcuLink is built using:</h3>
          <div className='flex flex-wrap justify-center gap-2'>
            {technologies.map((tech, index) => (
              <span
                key={tech.name}
                className={`${tech.color} text-white px-3 py-1 rounded-full text-sm font-bold`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  transform: hoveredIndex === index ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>
        <div className='mt-6 text-center'>
          <a
            href="https://github.com/suryxnshsingh/oculink"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-purple-500 text-white px-4 py-2 mx-8 rounded-full border-2 border-black text-sm font-bold hover:bg-purple-600 transition-colors duration-500"
          >
            <Star className="mr-2" />
            Give a star on GitHub
          </a>
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectInfo

