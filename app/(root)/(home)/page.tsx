import React from 'react'
import MeetingTypeList from '@/components/ui/MeetingTypeList';
import { useUser } from '@clerk/nextjs';
import CallList from '@/components/ui/CallList';

const Home = () => {

  const now = new Date()
  const date = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const time = now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: 'numeric' });

  return (
    <section className='flex size-full flex-col gap-10 '>
      <div className='md:h-[250px]  h-60 w-full border-black border-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] bg-green-200'>
        <div className='flex h-full flex-col justify-between max-md:px-5 max-md:py-9 lg:p-11'>
          <div className='mb-8 text-2xl font-semibold'>Hello, there!</div>
          <div className='flex flex-col gap-2'>
            <h1 className='text-4xl font-extrabold lg:text-7xl'>
              {time}
            </h1>
            <p className='text-lg font-medium lg:text-2xl'>
              {date}
            </p>
          </div>
        </div>
        <MeetingTypeList/>
      </div>
    </section>
  )
}

export default Home