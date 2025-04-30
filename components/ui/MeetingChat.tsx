"use client";

import React, { useState } from 'react';
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
import { MessageCircle, X } from 'lucide-react';
import Loader from './Loader';
import { Button } from './button';

interface MeetingChatProps {
  meetingId: string;
}

const MeetingChat = ({ meetingId }: MeetingChatProps) => {
  const { client, user, isLoading: clientLoading } = useStreamChatClient();
  const { channel, isLoading: channelLoading, error } = useMeetingChat(meetingId);
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  if (clientLoading || channelLoading) {
    return (
      <div className="fixed bottom-20 right-5 z-40">
        <Button 
          onClick={toggleChat}
          className="rounded-full p-3 bg-green-200 hover:bg-green-300 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          aria-label="Chat loading"
        >
          <MessageCircle size={24} />
        </Button>
      </div>
    );
  }

  if (error || !client || !channel) {
    return (
      <div className="fixed bottom-20 right-5 z-40">
        <Button 
          onClick={() => alert('Chat not available')}
          className="rounded-full p-3 bg-red-200 hover:bg-red-300 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          aria-label="Chat unavailable"
        >
          <MessageCircle size={24} />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Chat toggle button */}
      <div className="fixed bottom-20 right-5 z-40">
        <Button 
          onClick={toggleChat}
          className={cn(
            "rounded-full p-3 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]",
            isOpen ? "bg-red-200 hover:bg-red-300" : "bg-green-200 hover:bg-green-300"
          )}
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </Button>
      </div>

      {/* Chat panel */}
      {isOpen && (
        <div 
          className={cn(
            "fixed right-5 bottom-32 z-40 w-80 h-96 flex flex-col",
            "bg-green-100 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]",
            "rounded-md overflow-hidden",
            "animate-in slide-in-from-right duration-300"
          )}
        >
          <div className="p-2 bg-green-200 border-b-2 border-black font-bold flex justify-between items-center">
            <span>Meeting Chat</span>
            <Button 
              onClick={toggleChat}
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