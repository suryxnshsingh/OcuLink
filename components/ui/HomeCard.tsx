import { cn } from '@/lib/utils';
import Image from 'next/image'
import React from 'react'
import { motion } from 'framer-motion'

interface HomeCardProps {
    className?: string;
    img?: string;
    title?: string;
    description?: string;
    handleClick?: () => void;
}

const HomeCard = ({className, img, title, description, handleClick}: HomeCardProps) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }} 
      whileTap={{ scale: 0.95 }}
      className={cn(`rounded-xl px-4 py-4 flex flex-col justify-between w-full  h-40 lg:h-[260px]
        cursor-pointer  border-black border-4 shadow-[5px_5px_0px_rgba(0,0,0,1)]`, className)} 
      onClick={handleClick}
    >
      <div className='flex-center glassmorphism size-12 rounded-xl'>
        <Image src={img||""} width={'24'} height={'24'} alt='icon'/>
      </div>
      <div>
        <h1 className='text-2xl font-bold text-white'>{title}</h1>
        <p className='text-lg font-normal text-white'>{description}</p>
      </div>
    </motion.div>
  )
}

export default HomeCard