import { cn } from '@/lib/utils';
import { CallControls, CallParticipantsList, CallStatsButton, PaginatedGridLayout, SpeakerLayout } from '@stream-io/video-react-sdk';
import React, { useState } from 'react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { LayoutList, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import EndCallButton from './EndCallButton';
  

type callLayoutType = 'speaker-left' | 'speaker-right' | 'grid'
const MeetingRoom = () => {
    const  searchParams  = useSearchParams();
    const [layout, setLayout] = useState<callLayoutType>('speaker-left');
    const [showParticipant, setShowParticipant] = useState(false);
    const isPersonalRoom = !!searchParams.get('personal');

    const CallLayout = () => {
        switch (layout) {
            case 'grid':
                return <PaginatedGridLayout/>

            case 'speaker-right':
                return <SpeakerLayout
                participantsBarPosition={'right'}/>

            default:
                return <SpeakerLayout
                participantsBarPosition={'left'}/>

        }
    }


  return (
    <section className='relative h-screen w-full overflow-hidden bg-white bg-grid-small-black/[0.2]'>
        <div className='relative flex size-full items-center justify-center'>
            <div className='flex size-full items-center max-w-[1000px] '>
                <CallLayout/>
            </div>
            <div className={cn('h-[calc(100vh-100px)] ml-5 hidden',{'show-block': showParticipant})}>
                <CallParticipantsList onClose={(() => setShowParticipant(false))}/>
            </div>
        </div>
        <div className='fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap'>
            
            <CallControls/>
            
            <DropdownMenu>
            <div className='flex items-center'>
            <DropdownMenuTrigger className='cursor-pointer p-2 bg-green-200 border-2 border-black hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]'>
                <LayoutList size={20} className='text-black'/>
            </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent className='bg-green-200 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]d'>
                {['grid', 'speaker-left', 'speaker-right'].map((item, index) => (
                    <div key={index} >
                        <DropdownMenuItem 
                        className='flex justify-center items-center text-center cursor-pointer'
                        onClick={() => setLayout(item.toLowerCase() as callLayoutType)}>
                            {item}</DropdownMenuItem>
                            <DropdownMenuSeparator></DropdownMenuSeparator>
                    </div>
                ))}
            </DropdownMenuContent>
            </DropdownMenu>
            
            <button onClick={() => setShowParticipant((prev)=> (!prev))}>
                <div className='cursor-pointer p-2 bg-green-200 border-2 border-black hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]'>
                    <Users size={20}/>
                </div>
            </button>
            
            {!isPersonalRoom && <EndCallButton/>}
        </div>
    </section>
  )
}

export default MeetingRoom