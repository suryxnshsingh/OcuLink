import StreamVideoProvider from '@/providers/streamClientProvider'
import { Metadata } from 'next';
import React, { ReactNode } from 'react'

export const metadata: Metadata = {
  title: "OcuLink",
  description: "A feature-rich video chat app",
  icons: {
    icon: {
      url: "/icons/video-chat.png",
    },
  }
};

const RootLayout = ({children}: {children:ReactNode}) => {
  return (
    <main>
        <StreamVideoProvider>
          {children}
        </StreamVideoProvider>
    </main>
  )
}

export default RootLayout