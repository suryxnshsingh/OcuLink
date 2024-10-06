"use client"

import { sidebarLinks } from '@/constansts'
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import React from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image';
import { SignedIn, UserButton, useUser } from '@clerk/nextjs';
const Sidebar = () => {
  const pathname = usePathname();
  const user = useUser()

  return (
    <section className='sticky left-0 top-0 flex  w-fit flex-col justify-between  p-6
    max-md:hidden lg:w-[264px] m-4 bg-blue-200 border-black border-4  shadow-[6px_6px_0px_rgba(0,0,0,1)]'>
       <div className='flex flex-1 flex-col gap-6'>
          {sidebarLinks.map((link) => {
            const isActive = pathname == link.route || pathname.startsWith(`$(link.route)/`);
            return (
              <Link 
              href = {link.route}
              key = {link.label}
              className={cn('flex gap-4 items-center p-4 rounded-xl justify-start text-black border-black border-2 shadow-[3.5px_5px_0px_rgba(0,0,0,1)] hover:bg-blue-400',{
                'bg-blue-400': isActive
              })}
              >
                
                <Image
                  src={link.nameUrl}
                  alt = {link.label}
                  width = {24}
                  height = {24}
                  >
                </Image>
                <p className='text-lg font-semibold max-lg:hidden'>{link.label}</p>
              </Link>
            )
          })}
       </div>
       <div className=" flex text-black">
        <SignedIn >
          <UserButton/>
          <p className='text-lg font-medium ml-3 mb-2'>{user.user?.fullName}</p>
        </SignedIn>
       </div>
    </section>
  )
}

export default Sidebar