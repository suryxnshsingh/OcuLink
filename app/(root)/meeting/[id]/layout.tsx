import React, { ReactNode } from 'react'

const RootLayout = ({children}:{ children: ReactNode }) => {
  return (
    <main className=''>
      {children}
    </main>
  )
} 

export default RootLayout