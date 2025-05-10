import { useEffect, useState, useRef } from 'react';
import { Channel } from 'stream-chat';
import { useStreamChatClient } from '@/providers/streamChatProvider';
import { createMeetingChatChannel } from '@/actions/stream.actions';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

export const useMeetingChat = (meetingId: string) => {
  const { client, user } = useStreamChatClient();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get call and call state to check if user has joined
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  
  // Use a ref to track the channel to avoid closure issues in cleanup
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    // Only initialize the chat if user has joined the call
    if (!client || !user || !meetingId || callingState !== 'joined') {
      setIsLoading(false);
      return;
    }

    console.log('Chat initialization started - user has joined the call');
    
    let isMounted = true;
    const initializeChannel = async () => {
      try {
        setIsLoading(true);
        
        // First, ensure the channel exists on the server
        try {
          await createMeetingChatChannel(meetingId);
          console.log('Channel creation/verification completed');
        } catch (serverError: unknown) {
          console.log('Server setup completed with notes:', serverError instanceof Error ? serverError.message : 'Unknown error');
          // Continue anyway, as the channel might still be usable
        }
        
        // If we already have a channel for this meeting, clean it up first
        if (channelRef.current) {
          try {
            console.log('Cleaning up previous channel watch');
            await channelRef.current.stopWatching();
            channelRef.current = null;
          } catch (cleanupErr) {
            console.error('Error cleaning up previous channel:', cleanupErr);
          }
        }
        
        // Create a channel client-side
        const channelInstance = client.channel('meeting', meetingId);
        
        try {
          // Watch the channel using client-side auth - this connects and subscribes to updates
          await channelInstance.watch();
          console.log('Successfully connected to channel client-side');
          
          // Only set state if the component is still mounted
          if (isMounted) {
            setChannel(channelInstance);
            channelRef.current = channelInstance;
            setError(null);
          } else {
            // If not mounted anymore, clean up the connection we just made
            console.log('Component unmounted during channel initialization, cleaning up');
            await channelInstance.stopWatching();
          }
        } catch (watchError) {
          console.error('Error watching channel:', watchError);
          if (isMounted) {
            setError('Unable to connect to chat');
            setChannel(null);
            channelRef.current = null;
          }
        }
      } catch (err) {
        console.error('Chat initialization error:', err);
        if (isMounted) {
          setError('Failed to initialize chat');
          setChannel(null);
          channelRef.current = null;
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeChannel();

    // Cleanup function
    return () => {
      console.log('Chat hook cleanup - unmounting');
      isMounted = false;
      
      // Explicitly clean up channel connection
      if (channelRef.current) {
        console.log('Stopping channel watch and cleaning up resources');
        // Using the ref to avoid closure issues
        channelRef.current.stopWatching().catch(err => {
          console.error('Error during channel cleanup:', err);
        });
        channelRef.current = null;
      }
    };
  }, [client, user, meetingId, callingState]); // Add callingState as dependency

  return { channel, isLoading, error };
};