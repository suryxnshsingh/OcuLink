import MobileNav from '@/components/mobileNav'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import React, { ReactNode } from 'react'

const HomeLayout = ({children}:{ children: ReactNode }) => {
  return (
    <main className='relative'>
      {/* <Navbar/> */}
      <MobileNav/>
      <div className='flex'>
        <Sidebar/>
        <section className='flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pb-14 sm:px-14'>
            {children}
        </section>
      </div>
    </main>
  )
} 

export default HomeLayout