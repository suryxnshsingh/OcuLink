"use client"

import React from 'react'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
import Image from 'next/image'
import { sidebarLinks } from '@/constansts'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const MobileNav = () => {

  const pathname = usePathname();

  return (

    <section>

        <Sheet >
        <SheetTrigger asChild>
            <Image
                src = "/icons/hamburger.svg"
                width={36}
                height={36}
                alt = "menu"
                className='cursor-pointer md:hidden '
            />
        </SheetTrigger>
        <SheetContent side={'left'} className='border-none w-full bg-white'>

            <div className='flex-col justify-between overflow-y-auto '>
                <SheetClose asChild>
                    <section className='flex h-full flex-col gap-6 pt-16'>
                        {sidebarLinks.map((link) => {
                            const isActive = pathname == link.route || pathname.startsWith(`$(link.route)`);
                            return (
                                <SheetClose asChild>
                                    <Link 
                                    href = {link.route}
                                    key = {link.label}
                                    className={cn('flex gap-4 items-center p-4 rounded-lg w-full',{
                                        'bg-[red]]': isActive
                                    })}
                                    >
                                        
                                        <Image
                                        src={link.nameUrl}
                                        alt = {link.label}
                                        width = {20}
                                        height = {20}
                                        >
                                        </Image>
                                        <p className='font-semibold'>{link.label}</p>
                                    </Link>
                                </SheetClose>
                            )
                        })}
                    </section>
                </SheetClose>
            </div>
        </SheetContent>
        </Sheet>


    </section>
  )
}

export default MobileNav