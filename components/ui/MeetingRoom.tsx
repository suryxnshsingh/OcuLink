import { cn } from '@/lib/utils';
import { CallControls, PaginatedGridLayout, SpeakerLayout, useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
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
import { Info, LayoutList, MessageCircle, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import MeetingEnd from './MeetingEnd';
import { Drawer, DrawerContent } from './drawer';
import { CallLayoutType, SidebarTabType } from '@/types/meeting';
import MeetingSidebar from './MeetingSidebar';

const MeetingRoom = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [layout, setLayout] = useState<CallLayoutType>('custom');
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<SidebarTabType>(null);
    const [callEnded, setCallEnded] = useState(false);
    const isPersonalRoom = !!searchParams.get('personal');
    const callJoinedRef = useRef(false);
    const [isMobile, setIsMobile] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    
    // Check if we're on mobile or desktop
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        
        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);
    
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

    // Toggle sidebar and set active tab
    const toggleSidebar = (tab: SidebarTabType) => {
        if (activeTab === tab) {
            // If clicking the same tab, close the sidebar/drawer
            setActiveTab(null);
            setSidebarVisible(false);
            setDrawerOpen(false);
        } else {
            // Otherwise, open the sidebar/drawer with the selected tab
            setActiveTab(tab);
            setSidebarVisible(true);
            setDrawerOpen(true);
        }
    };

    return (
        <section className='relative h-screen w-full overflow-hidden bg-green-50 bg-grid-small-black/[0.2]'>
            {/* Controls toolbar */}
            <div className='right-0 top-0 absolute z-40 p-5'>
                <div className='flex flex-col gap-2'>
                    <DropdownMenu>
                        <div className='flex items-center'>
                            <DropdownMenuTrigger className='cursor-pointer p-2 bg-green-200 hover:bg-green-300 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'>
                                <LayoutList size={20} className='text-black'/>
                            </DropdownMenuTrigger>
                        </div>
                        <DropdownMenuContent className='mb-6 bg-green-200 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]'>
                            {['grid', 'speaker-left', 'speaker-right', 'custom'].map((item, index) => (
                                <div key={index}>
                                    <DropdownMenuItem 
                                    className='flex justify-center items-center text-center cursor-pointer bg-green-300'
                                    onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}>
                                        {item}</DropdownMenuItem>
                                </div>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {/* People button */}
                    <button onClick={() => toggleSidebar('participants')}>
                        <div className={cn(
                            'cursor-pointer p-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]',
                            activeTab === 'participants' ? 'bg-red-200 hover:bg-red-300' : 'bg-green-200 hover:bg-green-300'
                        )}>
                            <Users size={20}/>
                        </div>
                    </button>

                    {/* Chat button */}
                    {call && (
                        <button onClick={() => toggleSidebar('chat')}>
                            <div className={cn(
                                'cursor-pointer p-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]',
                                activeTab === 'chat' ? 'bg-red-200 hover:bg-red-300' : 'bg-green-200 hover:bg-green-300'
                            )}>
                                <MessageCircle size={20}/>
                            </div>
                        </button>
                    )}

                    {/* Info button */}
                    {call && (
                        <button onClick={() => toggleSidebar('info')}>
                            <div className={cn(
                                'cursor-pointer p-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]',
                                activeTab === 'info' ? 'bg-red-200 hover:bg-red-300' : 'bg-green-200 hover:bg-green-300'
                            )}>
                                <Info size={20}/>
                            </div>
                        </button>
                    )}
                </div>
            </div>

            {/* Main container with flex layout to properly position content and sidebar */}
            <div className="flex h-full">
                {/* Main content area - ensure video is centered */}
                <div className={cn(
                    'flex-1 transition-all duration-300 ease-in-out',
                    'h-full overflow-hidden flex items-center justify-center'
                )}>
                    <div className="flex h-full w-full max-w-[1200px] mx-auto">
                        <CallLayout />
                    </div>
                </div>
                
                {/* Render drawer for mobile, sidebar for desktop */}
                {isMobile ? (
                    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                        <DrawerContent className="bg-green-200 border-t-2 rounded-t-3xl border-black h-[75vh]">
                            <MeetingSidebar 
                                activeTab={activeTab}
                                toggleSidebar={toggleSidebar}
                                isMobile={isMobile}
                                sidebarVisible={true}
                                setActiveTab={setActiveTab}
                                setSidebarVisible={setSidebarVisible}
                                call={call || null}
                                drawerOpen={drawerOpen}
                                setDrawerOpen={setDrawerOpen}
                            />
                        </DrawerContent>
                    </Drawer>
                ) : (
                    <MeetingSidebar 
                        activeTab={activeTab}
                        toggleSidebar={toggleSidebar}
                        isMobile={isMobile}
                        sidebarVisible={sidebarVisible}
                        setActiveTab={setActiveTab}
                        setSidebarVisible={setSidebarVisible}
                        call={call || null}
                    />
                )}
            </div>
            
            {/* Call controls at the bottom */}
            <div className='fixed bottom-0 flex w-full items-center justify-center flex-wrap z-50'>
                <CallControls/>
            </div>
        </section>
    );
}

export default MeetingRoom;