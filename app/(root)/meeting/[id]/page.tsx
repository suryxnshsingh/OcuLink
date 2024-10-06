"use client"
import MeetingSetup from '@/components/ui/MeetingSetup';
import MeetingRoom from '@/components/ui/MeetingRoom';
import { useUser } from '@clerk/nextjs';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useState } from 'react';
import Loader from '@/components/ui/Loader';
import { useGetCallById } from '@/hooks/useGetCallById';

import '@stream-io/video-react-sdk/dist/css/styles.css';

// import '../../../../app/my-styles.css';

const Meeting = ({params: {id}}: {params: {id: string}}) => {

  const {user , isLoaded} = useUser();
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const {call, callLoading} = useGetCallById(id);

  if(!isLoaded || callLoading) return <Loader/>

  return (
    <main className='h-screen w-full'>
      <StreamCall call={call}>
        <StreamTheme as ='main' className='str-video'>
          {!isSetupComplete ?(<MeetingSetup setIsSetupComplete={setIsSetupComplete} />):(<MeetingRoom/>)}
        </StreamTheme>
      </StreamCall>
    </main>
  )
}

export default Meeting