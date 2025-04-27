import React from 'react'
import MeetingTypeList from '@/components/ui/MeetingTypeList';
import Name from '@/components/ui/NameDateTime';

const Home = () => {
  return (
    <section className='flex size-full flex-col gap-10 '>
      <div className='md:h-[250px] h-60 w-full border-black border-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] bg-green-200'>
        <div className='flex h-full flex-col justify-between max-lg:px-5 max-lg:py-9 lg:p-11'>
          <div className='mb-8 text-2xl font-semibold flex'>Hello, <Name />!</div>
          <Name showDateTime={true} />
        </div>
        <MeetingTypeList/>
      </div>
    </section>
  )
}

export default Home