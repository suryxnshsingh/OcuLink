import React from 'react'
import ProjectInfo from '@/components/ui/ProjectInfo'
import DeveloperInfo from '@/components/ui/DeveloperInfo'
import Marquee from '@/components/ui/Marquee'
import CursorEffect from '@/components/ui/CursorEffect'

const AboutPage = () => {
  return (
    <div className='w-[88svw] md:w-[70svw] h-[115svh] md:h-[80svh]'>
        <h1 className='text-5xl font-extrabold'>About Us</h1>
      <div className='w-full h-full my-10 overflow-hidden bg-purple-100 border-black border-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative'>
        <CursorEffect />
        <div className='max-w-full mx-auto'>
          <div className='gap-8 mb-8 px-6'>
            <ProjectInfo />
          </div>
          <div className=''/>
          <Marquee/>
          <div className='gap-8 mb-8 px-6 z-20'>
            <DeveloperInfo />
          </div>
        </div>
        <div className='absolute bottom-4 right-4 text-5xl md:text-9xl font-bold text-purple-900/10 cursor-none z-0'>
          OcuLink
        </div>
      </div>
    </div>
  )
}

export default AboutPage

