"use client"
import { SignedIn, useUser } from '@clerk/nextjs'
import React from 'react'


const Name = () => {
    const user = useUser();
  return (
    <div>
        <SignedIn >
          <p className='pl-2'>{user.user?.firstName}</p>
        </SignedIn>
    </div>
  )
}

export default Name