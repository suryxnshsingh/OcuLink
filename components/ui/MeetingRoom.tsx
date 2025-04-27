import { cn } from '@/lib/utils';
import { CallControls, CallParticipantsList, CallStatsButton, PaginatedGridLayout, SpeakerLayout } from '@stream-io/video-react-sdk';
import React, { useState } from 'react'
import CustomLayout from './CustomLayout';

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
  

type callLayoutType = 'grid' | 'speaker-left' | 'speaker-right' | 'custom'
const MeetingRoom = () => {
    const  searchParams  = useSearchParams();
    const [layout, setLayout] = useState<callLayoutType>('custom');
    const [showParticipant, setShowParticipant] = useState(false);
    const isPersonalRoom = !!searchParams.get('personal');

    const CallLayout = () => {
        switch (layout) {
            case 'grid':
                return <PaginatedGridLayout/>

            case 'speaker-right':
                return <SpeakerLayout
                participantsBarPosition={'right'}/>

            case 'speaker-left':
                return <SpeakerLayout
                participantsBarPosition={'left'}/>
                
            default:
                return <CustomLayout />
        }
    }


  return (
    <section className='relative h-screen w-full overflow-hidden bg-green-50 bg-grid-small-black/[0.2]'>
        {!showParticipant && (
            <div className='right-0 top-0 md:bottom-0 absolute z-50 p-5'>
                <DropdownMenu>
                <div className='flex items-center'>
                <DropdownMenuTrigger className='cursor-pointer p-2 mb-2 bg-green-200 hover:bg-green-300 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] '>
                    <LayoutList size={20} className='text-black'/>
                </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent className='mb-6 bg-green-200 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]'>
                    {['grid', 'speaker-left', 'speaker-right', 'custom'].map((item, index) => (
                        <div key={index} >
                            <DropdownMenuItem 
                            className='flex justify-center items-center text-center cursor-pointer bg-green-300'
                            onClick={() => setLayout(item.toLowerCase() as callLayoutType)}>
                                {item}</DropdownMenuItem>
                                
                        </div>
                    ))}
                </DropdownMenuContent>
                </DropdownMenu>
                
                <button onClick={() => setShowParticipant((prev)=> (!prev))}>
                    <div className='cursor-pointer p-2 bg-green-200 hover:bg-green-300 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'>
                        <Users size={20}/>
                    </div>
                </button>
            </div>
        )}
        <div className='relative flex size-full items-center justify-center'>
            <div className='flex size-full items-center max-w-[1000px] '>
                <CallLayout/>
            </div>
            {/* Participant list - overlay on mobile */}
            {showParticipant && (
                <div className={cn('fixed inset-0 bg-black/20 z-50 md:bg-transparent md:static md:z-auto', 'flex justify-end')}>
                    <div className={cn('h-full w-full max-w-[350px] bg-green-200 border-l-2 border-t-2 border-b-2 border-black md:h-[calc(100vh-100px)] md:border-2',
                    'animate-in slide-in-from-right duration-300')}>
                        <CallParticipantsList onClose={(() => setShowParticipant(false))}/>
                    </div>
                </div>
            )}
        </div>
        <div className='fixed bottom-0 flex w-full items-center justify-center flex-wrap'>
            
            <CallControls/>
            
            
            
            {/* {!isPersonalRoom && <EndCallButton/>} */}
        </div>
    </section>
  )
}

export default MeetingRoom