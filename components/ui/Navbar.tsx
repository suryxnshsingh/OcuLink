import React from 'react'
import MobileNav from './mobileNav'
const Navbar = () => {
  return (
    <div className=' md:hidden w-[screen-10] flex-between border-black border-2 m-2 shadow-[3px_3px_0px_rgba(0,0,0,1)]'>
        <h1 className='text-3xl font-bold m-2'>OcuLink</h1>
        <MobileNav/>
    </div>
  )
}

export default Navbar 