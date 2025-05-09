"use client"

import { useCallStateHooks } from '@stream-io/video-react-sdk';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';

/**
 * Available filter types for camera and microphone
 */
type FilterType = 'none' | 'grayscale' | 'sepia' | 'invert' | 'blur';

/**
 * Component for applying filters to camera and microphone streams
 */
const MediaFilters = () => {
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const { camera } = useCameraState();
  const { microphone } = useMicrophoneState();
  const { toast } = useToast();
  
  const [videoFilter, setVideoFilter] = useState<FilterType>('none');
  const [audioFilter, setAudioFilter] = useState<FilterType>('none');
  
  // Store filter registration object references
  const videoFilterRef = useRef<any>(null);
  const audioFilterRef = useRef<any>(null);

  /**
   * Apply video filter to camera stream
   */
  const applyVideoFilter = useCallback((filterType: FilterType) => {
    if (!camera) return;

    // First, clean up any existing filter
    if (videoFilterRef.current) {
      try {
        // The Stream SDK doesn't have an unregisterFilter method
        // We need to call the stop method on our filter's return object
        videoFilterRef.current.stop();
        videoFilterRef.current = null;
      } catch (err) {
        console.error('Failed to clean up existing video filter:', err);
      }
    }
    
    if (filterType === 'none') {
      setVideoFilter('none');
      return;
    }
    
    try {
      // Register new filter
      const registration = camera.registerFilter((inputStream: MediaStream) => {
        // Create a new video element to process the input stream
        const videoEl = document.createElement('video');
        videoEl.srcObject = inputStream;
        videoEl.autoplay = true;
        videoEl.muted = true;
        
        // Create canvas for processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Match canvas size to video dimensions
        canvas.width = 640; // Default size, will be updated
        canvas.height = 480;
        
        // Use canvas capture as output
        const outputStream = canvas.captureStream();
        
        // Video processing loop
        const processFrame = () => {
          if (videoEl.videoWidth) {
            // Update canvas size to match video
            if (canvas.width !== videoEl.videoWidth) {
              canvas.width = videoEl.videoWidth;
              canvas.height = videoEl.videoHeight;
            }
            
            // Draw video frame to canvas
            if (ctx) {
              ctx.drawImage(videoEl, 0, 0);
              
              // Apply selected filter effect based on type
              switch (filterType) {
                case 'grayscale':
                  ctx.filter = 'grayscale(100%)';
                  break;
                case 'sepia':
                  ctx.filter = 'sepia(100%)';
                  break;
                case 'invert':
                  ctx.filter = 'invert(100%)';
                  break;
                case 'blur':
                  ctx.filter = 'blur(5px)';
                  break;
                default:
                  ctx.filter = 'none';
              }
              
              // Re-draw with filter
              ctx.drawImage(videoEl, 0, 0);
              ctx.filter = 'none';
            }
          }
          
          // Continue processing frames
          animationFrameId = requestAnimationFrame(processFrame);
        };
        
        // Start processing
        let animationFrameId = requestAnimationFrame(processFrame);
        
        // Create stop function for cleanup
        const stopFunc = () => {
          cancelAnimationFrame(animationFrameId);
          if (videoEl.srcObject) {
            videoEl.srcObject = null;
          }
        };
        
        // Return the processed stream and cleanup function
        return {
          output: outputStream,
          stop: stopFunc
        };
      });
      
      // Store the registration object for later cleanup
      videoFilterRef.current = registration;
      setVideoFilter(filterType);
      
      toast({
        title: 'Video Filter Applied',
        description: `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} filter enabled`
      });
      
    } catch (err) {
      console.error('Failed to apply video filter:', err);
      toast({
        title: 'Filter Error',
        description: 'Failed to apply video filter. Your browser may not support this feature.'
      });
    }
  }, [camera, toast]);
  
  /**
   * Apply audio filter to microphone stream
   * Note: Audio processing is more complex and typically requires Web Audio API
   * This is a simplified demonstration
   */
  const applyAudioFilter = useCallback((filterType: FilterType) => {
    if (!microphone) return;
    
    // First, clean up any existing filter
    if (audioFilterRef.current) {
      try {
        audioFilterRef.current.stop();
        audioFilterRef.current = null;
      } catch (err) {
        console.error('Failed to clean up existing audio filter:', err);
      }
    }
    
    if (filterType === 'none') {
      setAudioFilter('none');
      return;
    }
    
    try {
      // Register new filter
      const registration = microphone.registerFilter((inputStream: MediaStream) => {
        // For simplicity, we'll just pass through the audio for this example
        // Real audio filters would use Web Audio API to modify the audio stream
        
        toast({
          title: 'Audio Filter Simulated',
          description: `${filterType} effect would be applied in a full implementation`
        });
        
        return {
          // Just pass through the original stream for this demo
          output: inputStream,
          stop: () => {
            // Cleanup would happen here
          }
        };
      });
      
      // Store the registration object for later cleanup
      audioFilterRef.current = registration;
      setAudioFilter(filterType);
      
    } catch (err) {
      console.error('Failed to apply audio filter:', err);
      toast({
        title: 'Filter Error',
        description: 'Failed to apply audio filter. Your browser may not support this feature.'
      });
    }
  }, [microphone, toast]);
  
  // Clean up filters when component unmounts
  useEffect(() => {
    return () => {
      if (videoFilterRef.current) {
        try {
          videoFilterRef.current.stop();
        } catch (error) {
          console.error('Error cleaning up video filter:', error);
        }
      }
      if (audioFilterRef.current) {
        try {
          audioFilterRef.current.stop();
        } catch (error) {
          console.error('Error cleaning up audio filter:', error);
        }
      }
    };
  }, []);
  
  // Filter buttons component to avoid repetition
  const FilterButtons = ({ 
    filterType, 
    setFilter, 
    type 
  }: { 
    filterType: FilterType, 
    setFilter: (type: FilterType) => void, 
    type: 'video' | 'audio'
  }) => {
    const filters: FilterType[] = ['none', 'grayscale', 'sepia', 'invert', 'blur'];
    
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {filters.map((filter) => (
          <Button
            key={`${type}-${filter}`}
            onClick={() => setFilter(filter)}
            className={`text-xs py-1 px-2 border border-black ${filterType === filter 
              ? 'bg-blue-300 shadow-[2px_2px_0px_rgba(0,0,0,1)]' 
              : 'bg-blue-100 hover:bg-blue-200'}`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto">      
      <div className="mb-4">
        <h4 className="font-medium mb-1">Video Filters</h4>
        <FilterButtons 
          filterType={videoFilter} 
          setFilter={applyVideoFilter} 
          type="video" 
        />
      </div>
      
      <div>
        <h4 className="font-medium mb-1">Audio Effects</h4>
        <FilterButtons 
          filterType={audioFilter} 
          setFilter={applyAudioFilter} 
          type="audio" 
        />
        <p className="text-xs text-gray-500 mt-1 text-center">
          Note: Audio filters are simulated in this example
        </p>
      </div>
    </div>
  );
};

export default MediaFilters;