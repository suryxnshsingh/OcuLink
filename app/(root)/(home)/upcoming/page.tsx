import CallList from '@/components/ui/CallList'
import React from 'react'

const Upcoming = () => {
  return (
    <section className='flex size-full flex-col gap-5 '>
      <h1 className='text-5xl font-extrabold'>Upcoming</h1>
      <CallList type='upcoming' />
    </section>
  )
}

export default Upcoming