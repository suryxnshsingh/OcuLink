import CallList from '@/components/ui/CallList'
import React from 'react'

const Previous = () => {
  return (
    <section className='flex size-full flex-col gap-10'>
      <h1 className='text-5xl font-extrabold'>Previous</h1>
      <CallList type='ended'/>
    </section>
  )
}

export default Previous