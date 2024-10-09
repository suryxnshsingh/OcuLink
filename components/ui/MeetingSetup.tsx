"use client"
import { cn } from '@/lib/utils';
import { DeviceSettings, useCall, VideoPreview } from '@stream-io/video-react-sdk'
import React, { useEffect, useState } from 'react'
import { Button } from './button';


const MeetingSetup = ({setIsSetupComplete}:{setIsSetupComplete: (value: boolean)=>void}) => {
    const [avToggle, setAvToggle] = useState(false);
    const call = useCall();
    if(!call){
        throw new Error('useCall must be used inside a StreamCall component');
    }

    useEffect(() => {
        if(avToggle){
            call?.microphone.disable();
            call?.camera.disable();
        } else {
            call?.camera.enable();
            call?.microphone.enable();
        }

    },[avToggle, call?.camera, call?.microphone])

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center bg-green-50 gap-3 bg-grid-black/[0.2] p-4'>
        <h1 className='text-4xl font-bold'>Meeting Setup</h1>
        
        <VideoPreview className='w-3/4 min-lg:w-2/3 h-2/3 rounded-none border-black border-4 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)] '/>
        <div className='flex h-16 items-center justify-center gap-3'>
            <label className='flex items-center justify-center gap-2 font-medium'>
                <input 
                type='checkbox' 
                checked={avToggle} 
                onChange={() => setAvToggle(!avToggle)} 
                className={cn(
                    "appearance-none outline-none block relative text-center cursor-pointer m-auto w-5 h-5  before:block before:absolute before:content-[''] before:bg-green-200 before:w-5 before:h-5 before:rounded-sm before:border-black before:border-2 before:hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]  after:block after:content-[''] after:absolute after:left-1.5 after:top-0.5 after:w-2 after:h-3 after:border-black after:border-r-2 after:border-b-2 after:origin-center after:rotate-45",
                    { "after:opacity-1 before:checked:bg-green-200": avToggle},
                    { "after:opacity-0": !avToggle }
                  )}/>Join call with Mic & Camera OFF
            </label>
            <DeviceSettings/>
        </div>
        <Button 
        className='bg-green-400 border-2 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] text-xl font-bold'
        onClick={() => {call?.join();
         setIsSetupComplete(true)}}>
            Join Meeting</Button>
    </div>
  )
}

export default MeetingSetup