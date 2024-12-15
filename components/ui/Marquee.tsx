'use client'
import React from 'react'
import { motion } from 'framer-motion'

const Marquee = () => {
  return (
    <div className='overflow-hidden my-8 py-4 bg-gradient-to-r from-purple-400 to-pink-400 border-black border-y-4'>
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ 
          repeat: Infinity, 
          repeatType: "loop", 
          duration: 20,
          ease: "linear"
        }}
        className='whitespace-nowrap'
      >
        <span className='text-3xl font-bold mx-4'>Real-time Communication</span>
        <span className='text-3xl font-bold mx-4'>•</span>
        <span className='text-3xl font-bold mx-4'>Video Conferencing</span>
        <span className='text-3xl font-bold mx-4'>•</span>
        <span className='text-3xl font-bold mx-4'>Scheduling</span>
        <span className='text-3xl font-bold mx-4'>•</span>
        <span className='text-3xl font-bold mx-4'>Collaboration</span>
        <span className='text-3xl font-bold mx-4'>•</span>
        <span className='text-3xl font-bold mx-4'>Joining Meetings</span>
        <span className='text-3xl font-bold mx-4'>•</span>
        <span className='text-3xl font-bold mx-4'>Recordings</span>
        <span className='text-3xl font-bold mx-4'>•</span>
        <span className='text-3xl font-bold mx-4'>Creating Meetings</span>
        <span className='text-3xl font-bold mx-4'>•</span>
        <span className='text-3xl font-bold mx-4'>Meeting Layouts</span>
        <span className='text-3xl font-bold mx-4'>•</span>
        <span className='text-3xl font-bold mx-4'>Screen Share</span>
        <span className='text-3xl font-bold mx-4'>•</span>
        <span className='text-3xl font-bold mx-4'>Participant Lists</span>
        <span className='text-3xl font-bold mx-4'>•</span>
        <span className='text-3xl font-bold mx-4'>Meeting Controls</span>
        <span className='text-3xl font-bold mx-4'>•</span>
        <span className='text-3xl font-bold mx-4'>Join via Links</span>
        <span className='text-3xl font-bold mx-4'>•</span>
        <span className='text-3xl font-bold mx-4'>Personal Room</span>
      </motion.div>
    </div>
  )
}

export default Marquee

