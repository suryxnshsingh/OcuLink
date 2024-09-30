"use client"

import { sidebarLinks } from '@/constansts'
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import React from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image';
const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className='sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-dark-1 p-6 pt-28 
    max-md:hidden lg:w-[264px] text-white'>
       <div className='flex flex-1 flex-col gap-6'>
          {sidebarLinks.map((link) => {
            const isActive = pathname == link.route || pathname.startsWith(link.route);
            return (
              <Link 
              href = {link.route}
              key = {link.label}
              className={cn('flex gap-4 items-center p-4 rounded-lg justify-start',{
                'bg-black text-white': isActive
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
    </section>
  )
}

export default Sidebar