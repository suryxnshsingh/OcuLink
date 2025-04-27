"use client"
import { SignedIn, useUser } from '@clerk/nextjs'
import React, { useState, useEffect } from 'react'

const Name = ({ showDateTime = false }) => {
    const user = useUser();
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('');
  
    useEffect(() => {
      if (showDateTime) {
        // Update time and date initially
        updateDateTime();
        
        // Set up interval to update time every minute
        const intervalId = setInterval(updateDateTime, 60000);
        
        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
      }
    }, [showDateTime]);
  
    const updateDateTime = () => {
      const now = new Date();
      setDate(now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      setTime(now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: 'numeric' }));
    };

  return (
    <>
      {!showDateTime ? (
        <div>
          <SignedIn>
            <p className='pl-2'>{user.user?.firstName || 'User'}</p>
          </SignedIn>
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          <h1 className='text-4xl font-extrabold lg:text-7xl'>
            {time}
          </h1>
          <p className='text-lg font-medium lg:text-2xl'>
            {date}
          </p>
        </div>
      )}
    </>
  )
}

export default Name