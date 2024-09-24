import React, { ReactNode } from 'react'

const RootLayout = ({children}:{ children: ReactNode }) => {
  return (
    <main>
      navbar
      sidebar
      {children}
    </main>
  )
} 

export default RootLayout