"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StreamChat, User } from 'stream-chat';
import { ChatProvider } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { getChatToken } from '@/actions/stream.actions';

type StreamChatContextType = {
  client: StreamChat | null;
  user: User | null;
  isLoading: boolean;
};

const StreamChatContext = createContext<StreamChatContextType>({
  client: null,
  user: null,
  isLoading: true,
});

export const useStreamChatClient = () => useContext(StreamChatContext);

export const StreamChatClientProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        
        // Get token from server
        const { token, userId, userName, userImage } = await getChatToken();
        
        if (!token || !userId) {
          console.error('Failed to get chat token');
          setIsLoading(false);
          return;
        }
        
        // Initialize chat client
        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY as string;
        const chatClient = StreamChat.getInstance(apiKey);
        
        // Connect user
        await chatClient.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        
        setClient(chatClient);
        setUser({
          id: userId,
          name: userName,
          image: userImage,
        });
        
      } catch (error) {
        console.error('Error connecting to Stream Chat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup when component unmounts
    return () => {
      if (client) {
        client.disconnectUser().then(() => {
          console.log('User disconnected from chat');
        });
      }
    };
  }, []);

  // We only provide the client context, not the full Chat UI component
  return (
    <StreamChatContext.Provider value={{ client, user, isLoading }}>
      {children}
    </StreamChatContext.Provider>
  );
};