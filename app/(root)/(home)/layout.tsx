
import Navbar from '@/components/ui/Navbar'
import Sidebar from '@/components/ui/Sidebar'
import React, { ReactNode } from 'react'

const HomeLayout = ({children}:{ children: ReactNode }) => {
  return (
    <main className='relative'>
      <div className="h-full w-full bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative items-center justify-center">
      <Navbar/>
      <div className='flex'>
        <Sidebar/>
        <section className='flex min-h-screen flex-1 flex-col px-6 py-6 max-md:pb-14 sm:px-14'>
            {children}
        </section>
      </div>
      </div>
    </main>
  )
} 

export default HomeLayout