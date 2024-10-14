import React from 'react'
import MobileNav from './mobileNav'
import { SignedIn, UserButton } from '@clerk/nextjs'
const Navbar = () => {
  return (
    <div className=' md:hidden w-[screen-10] flex-between  bg-white border-black border-2 m-2 shadow-[3px_3px_0px_rgba(0,0,0,1) mt-2 ]'>
        <h1 className='text-3xl font-bold m-2 '>OcuLink</h1>
        <div className='flex'>
          <SignedIn  >
              <UserButton/>
          </SignedIn>
          <MobileNav/>
        </div>
    </div>
  )
}

export default Navbar