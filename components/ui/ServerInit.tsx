"use client";

import { useEffect } from 'react';
import { ensureMeetingChannelType } from '@/actions/stream.actions';

const ServerInit = () => {
  useEffect(() => {
    // Initialize server-side resources on app load
    const initializeServer = async () => {
      try {
        // Ensure the meeting channel type exists
        await ensureMeetingChannelType();
      } catch (error) {
        console.error('Failed to initialize server resources:', error);
      }
    };

    initializeServer();
  }, []);

  // This is a utility component that doesn't render anything
  return null;
};

export default ServerInit;