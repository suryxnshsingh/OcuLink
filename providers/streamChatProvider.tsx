"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  
  // Use ref to track client instance for proper cleanup
  const clientRef = useRef<StreamChat | null>(null);
  
  // Track initialization
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        
        // First disconnect any existing client
        if (clientRef.current) {
          try {
            await clientRef.current.disconnectUser();
            console.log('Disconnected previous user session');
          } catch (disconnectError) {
            console.error('Error disconnecting previous session:', disconnectError);
          }
          clientRef.current = null;
        }
        
        // Get token from server
        const { token, userId, userName, userImage } = await getChatToken();
        
        if (!token || !userId) {
          console.error('Failed to get chat token');
          setIsLoading(false);
          return;
        }
        
        // Initialize chat client
        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY as string;
        
        // Force a new client instance to prevent memory issues
        const chatClient = StreamChat.getInstance(apiKey, {
          enableInsights: false,  // Disable analytics to reduce memory
          enableWSFallback: true, // Enable fallback for reliability
        });
        
        // Connect user with minimal options
        await chatClient.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        
        // Store in state and ref
        setClient(chatClient);
        setUser({
          id: userId,
          name: userName,
          image: userImage,
        });
        clientRef.current = chatClient;
        
      } catch (error) {
        console.error('Error connecting to Stream Chat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup when component unmounts
    return () => {
      const cleanup = async () => {
        if (clientRef.current) {
          try {
            console.log('Disconnecting user from chat on unmount');
            await clientRef.current.disconnectUser();
            // Help garbage collection
            clientRef.current = null;
          } catch (err) {
            console.error('Error disconnecting user:', err);
          }
        }
      };
      
      cleanup();
    };
  }, []);

  // We only provide the client context, not the full Chat UI component
  return (
    <StreamChatContext.Provider value={{ client, user, isLoading }}>
      {children}
    </StreamChatContext.Provider>
  );
};