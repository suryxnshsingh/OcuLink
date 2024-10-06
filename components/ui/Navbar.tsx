import React from 'react'
import MobileNav from './mobileNav'
const Navbar = () => {
  return (
    <div className='md:hidden w-screen flex-between'>
        Navbar
        <MobileNav/>
    </div>
  )
}

export default Navbar 