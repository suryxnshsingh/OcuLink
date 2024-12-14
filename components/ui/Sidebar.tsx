"use client"

import { sidebarLinks } from '@/constansts'
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import React from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton, UserProfile, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const pathname = usePathname();
  const user = useUser();

  return ( 
    <motion.section 
      className='sticky left-0 top-0 flex  w-fit flex-col justify-between  p-6 max-lg:p-4 poppins
      max-md:hidden lg:w-[264px] md:w-[100px] h-[95vh] m-4 bg-blue-200 border-black border-4  shadow-[6px_6px_0px_rgba(0,0,0,1)]'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
       <div className='flex flex-1 flex-col gap-6'>
          {sidebarLinks.map((link) => {
            const isActive = pathname == link.route || pathname.startsWith(`$(link.route)/`);
            return (
              <motion.div 
                key={link.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link 
                  href={link.route}
                  className={cn('flex gap-4 items-center p-4 rounded-xl justify-start text-black border-black border-2 shadow-[3.5px_5px_0px_rgba(0,0,0,1)] hover:bg-blue-400 transition-colors duration-400', {
                  'bg-blue-400': isActive
                  })}
                >
                  <Image
                  src={link.nameUrl}
                  alt={link.label}
                  width={24}
                  height={24}
                  />
                  <p className='text-lg font-semibold text-nowrap max-lg:hidden'>{link.label}</p>
                </Link>
              </motion.div>
            )
          })}
       </div>
       <motion.div 
         className=" flex text-black"
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
       >
        <SignedIn >
          <UserButton/>
            <div  className='cursor-pointer '>
            <p className='text-lg font-medium ml-3 max-lg:hidden '>{user.user?.fullName}</p>
            <p className='text-sm font-normal ml-3 max-lg:hidden '>{user.user?.username}</p>
          </div>
        </SignedIn>
       </motion.div>
    </motion.section>
  )
}

export default Sidebar