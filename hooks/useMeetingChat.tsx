import { useEffect, useState } from 'react';
import { Channel } from 'stream-chat';
import { useStreamChatClient } from '@/providers/streamChatProvider';
import { createMeetingChatChannel } from '@/actions/stream.actions';

export const useMeetingChat = (meetingId: string) => {
  const { client, user } = useStreamChatClient();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeChannel = async () => {
      if (!client || !user || !meetingId) {
        setIsLoading(false);
        return;
      }

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
          setChannel(channelInstance);
          setError(null);
        } catch (watchError) {
          console.error('Error watching channel:', watchError);
          setError('Unable to connect to chat');
          setChannel(null);
        }
      } catch (err) {
        console.error('Chat initialization error:', err);
        setError('Failed to initialize chat');
        setChannel(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChannel();

    // Cleanup function
    return () => {
      if (channel) {
        channel.stopWatching().catch(console.error);
      }
    };
  }, [client, user, meetingId]);

  return { channel, isLoading, error };
};