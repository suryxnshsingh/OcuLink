import { tokenProvider } from '@/actions/stream.actions';
import Loader from '@/components/ui/Loader';
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
            tokenProvider,
        });
        setVideoClient(client);
    }, [user, isLoaded])

    if(!videoClient) return <Loader/>

    return (
      <StreamVideo client={videoClient}>
        {children}
      </StreamVideo>
    );
  };

  export default StreamVideoProvider;