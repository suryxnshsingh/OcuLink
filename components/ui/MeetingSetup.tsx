"use client"
import { cn } from '@/lib/utils';
import { DeviceSettings, useCall, VideoPreview, useCallStateHooks } from '@stream-io/video-react-sdk'
import React, { useEffect, useState } from 'react'
import { Button } from './button';
import { CameraIcon, MicIcon, WandSparkles, X, MoreVertical, CameraOff, MicOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import DeviceSelector from './DeviceSelector';
import MediaFilters from './MediaFilters';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const MeetingSetup = ({setIsSetupComplete}:{setIsSetupComplete: (value: boolean)=>void}) => {
    const [avToggle, setAvToggle] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showDeviceDialog, setShowDeviceDialog] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const call = useCall();
    const { toast } = useToast();
    
    if(!call){
        throw new Error('useCall must be used inside a StreamCall component');
    }

    // Using hooks from Stream SDK for camera and microphone management
    const { useCameraState, useMicrophoneState, useSpeakerState } = useCallStateHooks();
    
    // Camera state
    const { 
        camera, 
        mediaStream: cameraMediaStream, 
        isMute: cameraIsMute, 
        hasBrowserPermission: cameraPermission, 
        selectedDevice: selectedCameraDevice,
        devices: cameraDevices
    } = useCameraState();
    
    // Define camera permission prompting state
    const isPromptingCameraPermission = false; // Default value since property doesn't exist
    
    // Microphone state
    const { 
        microphone, 
        mediaStream: micMediaStream, 
        isMute: micIsMute, 
        hasBrowserPermission: micPermission, 
        isSpeakingWhileMuted,
        selectedDevice: selectedMicDevice,
        devices: micDevices
    } = useMicrophoneState();
    
    // Microphone permission state
    const isPromptingMicPermission = false; // Define a default value since the property doesn't exist
    
    // Speaker state
    const { 
        speaker, 
        selectedDevice: selectedSpeaker, 
        devices: speakerDevices, 
        isDeviceSelectionSupported: isSpeakerSelectionSupported 
    } = useSpeakerState();

    // Get selected camera and microphone info
    const selectedCameraInfo = cameraDevices?.find(d => d.deviceId === selectedCameraDevice);
    const selectedMicInfo = micDevices?.find(d => d.deviceId === selectedMicDevice);

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

    // Handle mic speaking while muted notification
    useEffect(() => {
        if (isSpeakingWhileMuted) {
            toast({
                title: "You're speaking while muted",
                description: "Your microphone is muted but you're speaking",
            });
        }
    }, [isSpeakingWhileMuted, toast]);

    // Toggle camera and microphone based on avToggle state
    useEffect(() => {
        if(avToggle){
            microphone.disable();
            camera.disable();
        } else {
            camera.enable();
            microphone.enable();
        }
    }, [avToggle, camera, microphone]);

    // Camera toggle handler
    const toggleCamera = async () => {
        if (cameraIsMute) {
            await camera.enable();
        } else {
            await camera.disable();
        }
    };

    // Microphone toggle handler
    const toggleMicrophone = async () => {
        if (micIsMute) {
            await microphone.enable();
        } else {
            await microphone.disable();
        }
    };

    // Check if we need to display permission status messages
    const showPermissionStatus = !cameraPermission || !micPermission;

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    return (
        <div className='flex h-screen w-full flex-col items-center justify-center bg-green-50 gap-3 bg-grid-black/[0.2] p-4'>
            <h1 className='text-4xl font-bold'>Meeting Setup</h1>
            
            {/* Permission status messages */}
            {showPermissionStatus && (
                <div className='w-3/4 p-3 bg-yellow-100 border-2 border-black text-center'>
                    {!cameraPermission && (
                        <p className='text-sm text-amber-800 mb-1'>
                            {isPromptingCameraPermission 
                                ? "Please respond to the camera permission request" 
                                : "Camera permission denied. Please enable camera access in your browser settings."}
                        </p>
                    )}
                    {!micPermission && (
                        <p className='text-sm text-amber-800'>
                            {isPromptingMicPermission 
                                ? "Please respond to the microphone permission request" 
                                : "Microphone permission denied. Please enable microphone access in your browser settings."}
                        </p>
                    )}
                </div>
            )}
            
            {/* Video preview with overlay controls */}
            <div className={`relative ${isMobile ? 'w-[95%] h-[70vh]' : 'w-3/4 min-lg:w-2/3'}`}>
                <VideoPreview className={`w-full ${isMobile ? 'h-full' : 'h-96'} rounded-none border-black text-center border-double border-8`} />
                
                {/* Camera/mic controls overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    <Button 
                        onClick={toggleCamera}
                        className={`flex items-center gap-1 p-2 rounded-full ${cameraIsMute ? 'bg-red-100' : 'bg-green-100'} border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200`}
                        size="icon"
                    >
                        {cameraIsMute ? 
                            <CameraOff className="h-5 w-5 text-red-600" /> : 
                            <CameraIcon className="h-5 w-5 text-green-600" />
                        }
                    </Button>
                    <Button 
                        onClick={toggleMicrophone}
                        className={`flex items-center gap-1 p-2 rounded-full ${micIsMute ? 'bg-red-100' : 'bg-green-100'} border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200`}
                        size="icon"
                    >
                        {micIsMute ? 
                            <MicOff className="h-5 w-5 text-red-600" /> : 
                            <MicIcon className="h-5 w-5 text-green-600" />
                        }
                    </Button>
                </div>

                {/* 3-dot menu button for mobile device selector */}
                {isMobile && (
                    <Dialog open={showDeviceDialog} onOpenChange={setShowDeviceDialog}>
                        <DialogTrigger asChild>
                            <Button 
                                onClick={() => setShowDeviceDialog(true)}
                                className="absolute bottom-4 right-4 p-2 rounded-full border-2 border-black bg-white/80 hover:bg-white hover:translate-y-[-2px] transition-all duration-200 z-10"
                                size="icon"
                            >
                                <MoreVertical className="h-5 w-5 text-black" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border-2 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] rounded-none p-0 w-[90%] max-w-md max-h-[90vh] overflow-hidden">
                            <DialogHeader className="bg-green-200 border-b-2 border-black p-3 sticky top-0 z-10">
                                <DialogTitle className="font-bold text-center">Device Settings</DialogTitle>
                            </DialogHeader>
                            <div className="p-4 overflow-y-auto max-h-[70vh]">
                                <div className="px-1 pb-2">
                                    <DeviceSelector />
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Media filters button overlay in corner */}
                <Button 
                    onClick={toggleFilters}
                    className={`absolute top-4 right-4 p-2 rounded-full border-2 border-black shadow-md z-10 ${showFilters ? 'bg-blue-300' : 'bg-white/80'}`}
                    size="icon"
                >
                    <WandSparkles className="h-5 w-5" />
                </Button>
                
                {/* Media filters overlay */}
                {showFilters && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-sm">
                        <div className="relative bg-white/95 w-[90%] h-[90%] p-4 rounded-lg border-2 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] overflow-y-auto">
                            <Button 
                                onClick={toggleFilters}
                                className="absolute top-2 right-2 p-1 rounded-full border border-black bg-red-100"
                                size="icon"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <h3 className="text-lg font-bold mb-4 text-center">Media Filters & Effects</h3>
                            <MediaFilters />
                        </div>
                    </div>
                )}
            </div>
            
            {/* Device selector with three dropdowns in a row - only show on desktop */}
            {!isMobile && (
                <div className='w-3/4 mt-3 px-8'>
                    <DeviceSelector />
                </div>
            )}
            
            <Button 
            className={`bg-green-400 border-2 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] text-xl font-bold ${isMobile ? 'mt-5' : 'mt-2'}`}
            onClick={() => {
                call?.join();
                setIsSetupComplete(true)
            }}>
                Join Meeting
            </Button>
        </div>
    );
};

export default MeetingSetup;