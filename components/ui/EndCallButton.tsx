"use client"
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import React from 'react'
import { Button } from './button';
import { useRouter } from 'next/navigation';

const EndCallButton = () => {
    const call = useCall();
    const router = useRouter();
    const {useLocalParticipant} = useCallStateHooks();
    const localParticipant = useLocalParticipant();

    const isMeetingOwner = localParticipant && call?.state.createdBy && localParticipant.userId === call?.state.createdBy.id;

    if(!isMeetingOwner) return null;
  return (
    <Button
    className='cursor-pointer p-2 bg-red-500 border-2 border-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] max-md:hidden'
    onClick={async ()=>{
        await call.endCall();
    
        router.push('/');}}>End Call</Button>
  )
}

export default EndCallButton