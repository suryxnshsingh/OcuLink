import { cn } from '@/lib/utils';
import { CallControls, CallParticipantsList, PaginatedGridLayout, SpeakerLayout, useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import React, { useState, useEffect, useRef } from 'react'
import CustomLayout from './CustomLayout';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import useNotificationSounds from '@/hooks/useNotificationSounds';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Copy, LayoutList, MessageCircle, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import MeetingEnd from './MeetingEnd';
import MeetingChat from './MeetingChat';

type callLayoutType = 'grid' | 'speaker-left' | 'speaker-right' | 'custom'
const MeetingRoom = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [layout, setLayout] = useState<callLayoutType>('custom');
    const [showParticipant, setShowParticipant] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const isPersonalRoom = !!searchParams.get('personal');
    const callJoinedRef = useRef(false);
    
    const call = useCall();
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();
    
    // Initialize notification sounds for participant join/leave events
    useNotificationSounds();
    
    // Track if we need to force a re-render of the custom layout
    const forceUpdateKey = useRef(0);
    
    // Simple effect for call end detection
    useEffect(() => {
        // Only mark a call as joined after it has transitioned to an active state
        if (callingState === 'joined') {
            callJoinedRef.current = true;
        }

        // Only show meeting end screen if the call was previously joined
        // and now it's either 'idle' or 'left'
        if (callJoinedRef.current && (callingState === 'idle' || callingState === 'left')) {
            console.log('Call ended, showing end meeting screen');
            setCallEnded(true);
        }
    }, [callingState]);
    
    // Setup event listeners for call state changes
    useEffect(() => {
        if (!call) return;
        
        // When call state changes, force a re-render of the CustomLayout component
        const handleCallStateChange = () => {
            forceUpdateKey.current += 1;
            // We need to force a re-render of the component tree
            setLayout(prev => prev);
        };
        
        // Listen to participant joining/leaving and track publishing events
        call.on('call.session_participant_joined', handleCallStateChange);
        call.on('call.session_participant_left', handleCallStateChange);
        
        // Return cleanup function
        return () => {
            call.off('call.session_participant_joined', handleCallStateChange);
            call.off('call.session_participant_left', handleCallStateChange);
        };
    }, [call]);
    
    // Copy meeting URL to clipboard
    const copyMeetingUrl = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                toast({
                    title: "URL Copied!",
                    description: "Meeting link has been copied to clipboard",
                    variant: "default",
                });
            })
            .catch(err => {
                console.error('Failed to copy URL: ', err);
                toast({
                    title: "Copy failed",
                    description: "Could not copy the URL",
                    variant: "destructive",
                });
            });
    };

    // If call has ended, show the MeetingEnd component
    if (callEnded) {
        return <MeetingEnd />;
    }

    // Note: We pass the forceUpdateKey to force React to create a new instance of the layout
    // when any call state change is detected
    const CallLayout = () => {
        switch (layout) {
            case 'grid':
                return <PaginatedGridLayout/>;
            case 'speaker-right':
                return <SpeakerLayout participantsBarPosition={'right'}/>;
            case 'speaker-left':
                return <SpeakerLayout participantsBarPosition={'left'}/>;
            default:
                return <CustomLayout key={`custom-layout-${forceUpdateKey.current}`} />;
        }
    };

    // Toggle chat visibility
    const toggleChat = () => {
        setShowChat(!showChat);
    };

    return (
        <section className='relative h-screen w-full overflow-hidden bg-green-50 bg-grid-small-black/[0.2]'>
            {!showParticipant && (
                <div className='right-0 top-0 md:bottom-0 absolute z-50 p-5'>
                    <div className='flex flex-col gap-2'>
                        <DropdownMenu>
                            <div className='flex items-center'>
                                <DropdownMenuTrigger className='cursor-pointer p-2 bg-green-200 hover:bg-green-300 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] '>
                                    <LayoutList size={20} className='text-black'/>
                                </DropdownMenuTrigger>
                            </div>
                            <DropdownMenuContent className='mb-6 bg-green-200 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]'>
                                {['grid', 'speaker-left', 'speaker-right', 'auto'].map((item, index) => (
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

                        {/* Chat button moved to top toolbar */}
                        {call && (
                            <button onClick={toggleChat}>
                                <div className={cn(
                                    'cursor-pointer p-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]',
                                    showChat ? 'bg-red-200 hover:bg-red-300' : 'bg-green-200 hover:bg-green-300'
                                )}>
                                    <MessageCircle size={20}/>
                                </div>
                            </button>
                        )}

                        <button 
                            onClick={copyMeetingUrl}
                            className='cursor-pointer p-2 bg-green-200 hover:bg-green-300 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-2'
                            aria-label="Copy meeting link"
                        >
                            <Copy size={20} className='text-black'/>
                        </button>
                    </div>
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
            
            {/* Add chat component with controlled visibility */}
            {call && <MeetingChat meetingId={call.id} isOpen={showChat} onToggle={toggleChat} />}
            
            <div className='fixed bottom-0 flex w-full items-center justify-center flex-wrap'>
                <CallControls/>
            </div>
        </section>
    );
}

export default MeetingRoom;