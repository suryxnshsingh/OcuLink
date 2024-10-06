import CallList from '@/components/ui/CallList'
import React from 'react'

const recordings = () => {
  return (
    <section className='flex size-full flex-col gap-10 text-black'>
      <h1 className='text-5xl font-extrabold'>Recordings</h1>
      <CallList type='recordings' />
    </section>
  )
}

export default recordings