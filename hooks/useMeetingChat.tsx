import { useEffect, useState } from 'react';
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
        
        // Create a channel client-side
        const channelInstance = client.channel('meeting', meetingId);
        
        try {
          // Watch the channel using client-side auth - this connects and subscribes to updates
          await channelInstance.watch();
          console.log('Successfully connected to channel client-side');
          
          // Only set state if the component is still mounted
          if (isMounted) {
            setChannel(channelInstance);
            setError(null);
          }
        } catch (watchError) {
          console.error('Error watching channel:', watchError);
          if (isMounted) {
            setError('Unable to connect to chat');
            setChannel(null);
          }
        }
      } catch (err) {
        console.error('Chat initialization error:', err);
        if (isMounted) {
          setError('Failed to initialize chat');
          setChannel(null);
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
      isMounted = false;
      if (channel) {
        console.log('Stopping channel watch');
        channel.stopWatching().catch(console.error);
      }
    };
  }, [client, user, meetingId, callingState]); // Add callingState as dependency

  return { channel, isLoading, error };
};