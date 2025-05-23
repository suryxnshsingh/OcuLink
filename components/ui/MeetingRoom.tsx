import { cn } from '@/lib/utils';
import { CallControls, PaginatedGridLayout, SpeakerLayout, useCall, useCallStateHooks, LoadingIndicator } from '@stream-io/video-react-sdk';
import React, { useState, useEffect, useRef, useCallback } from 'react'
import CustomLayout from './CustomLayout';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import useNotificationSounds from '@/hooks/useNotificationSounds';

import { Info, MessageCircle, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import MeetingEnd from './MeetingEnd';
import { Drawer, DrawerContent } from './drawer';
import { CallLayoutType, SidebarTabType } from '@/types/meeting';
import MeetingSidebar from './MeetingSidebar';
import LayoutSelector from './LayoutSelector';
import { NeoBrutalVideoPlaceholder } from './NeoBrutalVideoPlaceholder';
import MobileCallControls from './MobileCallControls';

// Current Time component to display the current time
const CurrentTime = () => {
    const [time, setTime] = useState<string>('');
    
    useEffect(() => {
        // Update time initially
        updateTime();
        
        // Set up interval to update time every minute
        const intervalId = setInterval(updateTime, 60000);
        
        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, []);
    
    const updateTime = () => {
        const now = new Date();
        setTime(now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: 'numeric' }));
    };
    
    return (
        <div className="fixed left-8 bottom-6 z-50 cursor-pointer">
            <div className="bg-green-100 px-4 py-2 rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-medium">
                {time}
            </div>
        </div>
    );
};

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
            setIsMobile(window.innerWidth < 1024);
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

    // If call has ended, show the MeetingEnd component
    if (callEnded) {
        return <MeetingEnd />;
    }

    // Note: We pass the forceUpdateKey to force React to create a new instance of the layout
    // when any call state change is detected
    const CallLayout = () => {
        switch (layout) {
            case 'grid':
                return <PaginatedGridLayout VideoPlaceholder={NeoBrutalVideoPlaceholder}/>;
            case 'speaker-right':
                return <SpeakerLayout participantsBarPosition={'right'} VideoPlaceholder={NeoBrutalVideoPlaceholder}/>;
            case 'speaker-left':
                return <SpeakerLayout participantsBarPosition={'left'} VideoPlaceholder={NeoBrutalVideoPlaceholder}/>;
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
            <div className='fixed bottom-0 flex w-full items-center justify-center z-50 '>
                {isMobile ? (
                    <MobileCallControls 
                        toggleSidebar={toggleSidebar} 
                        activeTab={activeTab} 
                        // onLeave={() => router.push('/')} 
                    />
                ) : (
                    <div>
               
                    {/* Current time display */}
                    <CurrentTime />

                    {/* Call controls for desktop */}
                    <CallControls />
                    {/* <CallControls onLeave={() => router.push('/')} /> */}

                        {/* Controls toolbar */}

                        <div className='right-0 bottom-0 hidden lg:block absolute p-4 mr-2 pointer-events-auto'>
                            <div className='flex flex-row gap-4'>
                                {/* Using the external LayoutSelector component */}
                                <LayoutSelector 
                                    selectedLayout={layout}
                                    onLayoutChange={setLayout}
                                />
                                
                                {/* People button */}
                                <button onClick={() => toggleSidebar('participants')}>
                                    <div className={cn(
                                        'cursor-pointer p-2 rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-20',
                                        activeTab === 'participants' ? 'bg-red-200 hover:bg-red-300' : 'bg-green-100 hover:bg-green-200'
                                    )}>
                                        <Users size={20}/>
                                    </div>
                                </button>

                                {/* Chat button */}
                                {call && (
                                    <button onClick={() => toggleSidebar('chat')}>
                                        <div className={cn(
                                            'cursor-pointer p-2 rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-20',
                                            activeTab === 'chat' ? 'bg-red-200 hover:bg-red-300' : 'bg-green-100 hover:bg-green-200'
                                        )}>
                                            <MessageCircle size={20}/>
                                        </div>
                                    </button>
                                )}

                                {/* Info button */}
                                {call && (
                                    <button onClick={() => toggleSidebar('info')}>
                                        <div className={cn(
                                            'cursor-pointer p-2 rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-20',
                                            activeTab === 'info' ? 'bg-red-200 hover:bg-red-300' : 'bg-green-100 hover:bg-green-200'
                                        )}>
                                            <Info size={20}/>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default MeetingRoom;