"use server"

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";
import { StreamChat } from 'stream-chat';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

// Return type for the channel functions
interface ChannelResult {
  success: boolean;
  error?: string;
  channelId?: string;
}

// User token provider function
export const tokenProvider = async () => {
    const user = await currentUser();

    if(!user) throw new Error('User not found');
    if(!apiKey) throw new Error('No Stream API key provided');
    if(!apiSecret) throw new Error('No Stream API secret provided');

    const Client = new StreamClient(apiKey, apiSecret);
    
    const token = Client.generateUserToken({user_id: user.id});

    return token;
}

// Chat token generation for Stream Chat
export const getChatToken = async () => {
    const user = await currentUser();

    if(!user) throw new Error('User not found');
    if(!apiKey) throw new Error('No Stream API key provided');
    if(!apiSecret) throw new Error('No Stream API secret provided');

    // Server-side client to generate chat token
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    
    // Create a token with user ID
    const token = serverClient.createToken(user.id);
    
    return {
        token,
        userId: user.id,
        userName: user.username || user.firstName || 'Anonymous User',
        userImage: user.imageUrl
    };
}

// Create the meeting channel type if it doesn't exist
export const ensureMeetingChannelType = async (): Promise<ChannelResult> => {
    try {
        if(!apiKey) throw new Error('No Stream API key provided');
        if(!apiSecret) throw new Error('No Stream API secret provided');
        
        // Server-side client for channel type creation
        const serverClient = StreamChat.getInstance(apiKey, apiSecret);
        
        // First check if the channel type already exists
        let channelTypeExists = false;
        try {
            await serverClient.getChannelType('meeting');
            channelTypeExists = true;
            console.log('Meeting channel type already exists');
        } catch (getError) {
            console.log('Channel type does not exist yet');
        }
        
        // If it doesn't exist, create it
        if (!channelTypeExists) {
            try {
                console.log('Creating new meeting channel type');
                await serverClient.createChannelType({
                    name: 'meeting',
                    mutes: true,
                    reactions: true,
                    replies: true,
                    typing_events: true,
                    read_events: true,
                    connect_events: true,
                    search: true,
                    uploads: true,
                    url_enrichment: false,
                    permissions: [
                        { name: 'read-channel', priority: 999, resources: ['*'], roles: ['channel_member'], action: 'Allow' },
                        { name: 'read-channel', priority: 999, resources: ['*'], roles: ['user'], action: 'Allow' },
                        { name: 'read-channel', priority: 999, resources: ['*'], roles: ['anonymous'], action: 'Deny' },
                        { name: 'send-message', priority: 999, resources: ['*'], roles: ['channel_member'], action: 'Allow' },
                        { name: 'send-message', priority: 999, resources: ['*'], roles: ['user'], action: 'Allow' },
                        { name: 'send-message', priority: 999, resources: ['*'], roles: ['anonymous'], action: 'Deny' },
                    ]
                });
                console.log('Successfully created meeting channel type');
            } catch (createError: any) {
                // Handle case where channel type already exists (race condition)
                if (createError.message && createError.message.includes('channel type meeting already exists')) {
                    console.log('Channel type exists (race condition)');
                    channelTypeExists = true;
                } else {
                    throw createError;
                }
            }
        }
        
        return { success: true };
    } catch (error: any) {
        console.error('Failed to ensure meeting channel type exists:', error);
        // Return success true anyway, we'll try to use the channel even if type setup fails
        return { success: true, error: error.message };
    }
}

// Create a chat channel for a meeting
export const createMeetingChatChannel = async (meetingId: string): Promise<ChannelResult> => {
    try {
        const user = await currentUser();
        
        if(!user) throw new Error('User not found');
        if(!apiKey) throw new Error('No Stream API key provided');
        if(!apiSecret) throw new Error('No Stream API secret provided');
        if(!meetingId) throw new Error('Meeting ID is required');
        
        // Make sure channel type exists, but don't fail if it doesn't
        try {
            await ensureMeetingChannelType();
        } catch (typeError: any) {
            console.log('Channel type setup had issues, continuing anyway:', typeError.message);
        }
        
        // Server-side client for channel creation
        const serverClient = StreamChat.getInstance(apiKey, apiSecret);
        
        // Check if channel exists
        try {
            const existingChannel = serverClient.channel('meeting', meetingId);
            await existingChannel.query();
            console.log('Channel already exists, using existing channel');
            
            // Even if the channel exists, make sure it's set up correctly
            try {
                // Add the current user as a member if not already
                const members = await existingChannel.queryMembers({ user_id: user.id });
                if (members.members.length === 0) {
                    await existingChannel.addMembers([user.id]);
                    console.log('Added current user to existing channel');
                }
            } catch (memberError: any) {
                console.log('Error checking/adding channel membership:', memberError.message);
            }
            
            return { success: true, channelId: meetingId };
        } catch (queryError) {
            // Channel doesn't exist, create a new one with correct settings
            const channel = serverClient.channel('meeting', meetingId, {
                name: `Meeting Chat ${meetingId}`,
                created_by_id: user.id,
                // Create it with these important settings initially
                access_mode: 'open', // This is the key setting - "open" allows all authenticated users
                members: [user.id], // Start with the creator as a member
            });
            
            await channel.create();
            console.log('Created new channel for meeting:', meetingId);
            
            return { success: true, channelId: meetingId };
        }
    } catch (error: any) {
        console.error("Error creating meeting chat channel:", error);
        return { success: false, error: error.message };
    }
}