"use client";

import React, { useCallback } from 'react';
import { 
  Chat, 
  Channel as StreamChannel, 
  MessageList, 
  MessageInput, 
  Window
} from 'stream-chat-react';
import { useMeetingChat } from '@/hooks/useMeetingChat';
import { useStreamChatClient } from '@/providers/streamChatProvider';
import { cn } from '@/lib/utils';
import { LoaderCircle, X } from 'lucide-react';
import { Button } from './button';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

interface MeetingChatProps {
  meetingId: string;
  isOpen?: boolean;
  onToggle?: () => void;
  isSidebar?: boolean;
}

const MeetingChat = ({ meetingId, isOpen = false, onToggle, isSidebar = false }: MeetingChatProps) => {
  const { client, user, isLoading: clientLoading } = useStreamChatClient();
  const { channel, isLoading: channelLoading, error } = useMeetingChat(meetingId);
  
  // Check if the user has joined the call
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const isCallJoined = callingState === 'joined';
  const isLoading = clientLoading || channelLoading;

  if (!isCallJoined) {
    // Don't initialize chat until the call is joined
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !client || !channel) {
    // Show a simple error message or nothing at all
    return (
      <div className="flex h-full items-center justify-center p-4 text-center">
        <p className="text-sm">{error || "Chat unavailable"}</p>
      </div>
    );
  }

  // For sidebar mode, we just need to render the chat component directly
  if (isSidebar) {
    return (
      <div className="h-full flex flex-col">
        <Chat client={client} theme="messaging light">
          <StreamChannel channel={channel}>
            <Window>
              <MessageList />
              <MessageInput focus />
            </Window>
          </StreamChannel>
        </Chat>
      </div>
    );
  }

  // For floating window mode (original implementation)
  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div 
          className={cn(
            "fixed right-16 top-5 z-40 w-80 h-96 flex flex-col",
            "bg-green-100 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]",
            "rounded-md overflow-hidden",
            "animate-in slide-in-from-right duration-300"
          )}
        >
          <div className="p-2 bg-green-200 border-b-2 border-black font-bold flex justify-between items-center">
            <span>Meeting Chat</span>
            <Button 
              onClick={onToggle}
              className="p-1 bg-red-200 hover:bg-red-300 border-2 border-black"
              aria-label="Close chat"
            >
              <X size={16} />
            </Button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <Chat client={client} theme="messaging light">
              <StreamChannel channel={channel}>
                <Window>
                  <MessageList />
                  <MessageInput focus />
                </Window>
              </StreamChannel>
            </Chat>
          </div>
        </div>
      )}
    </>
  );
};

export default MeetingChat;