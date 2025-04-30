import StreamVideoProvider from '@/providers/streamClientProvider'
import { StreamChatClientProvider } from '@/providers/streamChatProvider'
import ServerInit from '@/components/ui/ServerInit'
import { Metadata } from 'next';
import React, { ReactNode } from 'react'
import '@/app/my-styles.css';

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
    <main >
        <ServerInit />
        <StreamVideoProvider>
          <StreamChatClientProvider>
            {children}
          </StreamChatClientProvider>
        </StreamVideoProvider>
    </main>
  )
}

export default RootLayout