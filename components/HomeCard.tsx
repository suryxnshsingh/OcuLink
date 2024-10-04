import { cn } from '@/lib/utils';
import Image from 'next/image'
import React from 'react'

interface HomeCardProps {
    className?: string;
    img?: string;
    title?: string;
    description?: string;
    handleClick?: () => void;
}
const HomeCard = ({className, img, title, description, handleClick}: HomeCardProps) => {
  return (
    <div className={cn(`mt-5 px-4 py-4 flex flex-col justify-between w-full xl:max-w-[270px] min-h-[260px]
        cursor-pointer  border-black border-4 shadow-[5px_5px_0px_rgba(0,0,0,1)]`, className)} onClick={()=>{}}>
            <div className='flex-center glassmorphism size-12 rounded-xl'>
              <Image src={img} width={24} height={24} alt=''/>
            </div>
            <div>
              <h1 className='text-2xl font-bold text-white'>{title}</h1>
              <p className='text-lg font-normal text-white'>{description}</p>
            </div>
        </div>
  )
}

export default HomeCard