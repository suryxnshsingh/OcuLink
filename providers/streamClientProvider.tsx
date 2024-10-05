import { useUser } from '@clerk/nextjs';
import {
    name,
    StreamCall,
    StreamVideo,
    StreamVideoClient,
    User,
  } from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';
  
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

  
  export const StreamVideoProvider = ({children}: {children: React.ReactNode}) => {

    const [videoClient, setVideoClient] = useState<StreamVideoClient | undefined>(undefined);
    const {user, isLoaded} = useUser();

    useEffect(() => {
        if(!isLoaded || !user) return;
        if (!apiKey) throw new Error('No Stream API key provided');
        const client = new StreamVideoClient({
            apiKey,
            user:{
                id: user?.id,
                name: user?.username || user?.id,
                image: user?.imageUrl,
            },
            tokenProvider: async () => {
                // Implement your token fetching logic here
                // For example:
                // const response = await fetch('/api/get-stream-token');
                // return response.text();
            }
        });
        setVideoClient(client);
    }, [user, isLoaded])

    return (
      <StreamVideo client={videoClient}>
        
      </StreamVideo>
    );
  };

  export default StreamVideoProvider;