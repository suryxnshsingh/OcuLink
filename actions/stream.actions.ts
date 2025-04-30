"use server"

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";
import { StreamChat } from 'stream-chat';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
    const user = await currentUser()!

    if(!user) throw Error('User not found');
    if(!apiKey) throw Error('No Stream API key provided');
    if(!apiSecret) throw Error('No Stream API secret provided');

    const Client = new StreamClient(apiKey, apiSecret)

    const exp= 60 * 60;
    const issued = Math.floor(Date.now() / 1000) -60 ;
    
    const token = Client.generateUserToken({user_id:user.id});

    return token;
}

// Chat token generation for Stream Chat
export const getChatToken = async () => {
    const user = await currentUser();

    if(!user) throw Error('User not found');
    if(!apiKey) throw Error('No Stream API key provided');
    if(!apiSecret) throw Error('No Stream API secret provided');

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
export const ensureMeetingChannelType = async () => {
    try {
        if(!apiKey) throw Error('No Stream API key provided');
        if(!apiSecret) throw Error('No Stream API secret provided');
        
        // Server-side client for channel type creation
        const serverClient = StreamChat.getInstance(apiKey, apiSecret);
        
        try {
            // Check if the channel type already exists
            await serverClient.getChannelType('meeting');
            console.log('Meeting channel type already exists');
            
            // Update the permissions for the existing channel type
            try {
                await serverClient.updateChannelType({
                    name: 'meeting',
                    permissions: [
                        // Allow any authenticated user to read the channel
                        { name: 'read-channel', priority: 999, resources: ['*'], role: 'channel_member', action: 'Allow' },
                        { name: 'read-channel', priority: 999, resources: ['*'], role: 'user', action: 'Allow' },
                        { name: 'read-channel', priority: 999, resources: ['*'], role: 'anonymous', action: 'Deny' },
                        
                        // Allow any authenticated user to send messages
                        { name: 'send-message', priority: 999, resources: ['*'], role: 'channel_member', action: 'Allow' },
                        { name: 'send-message', priority: 999, resources: ['*'], role: 'user', action: 'Allow' },
                        { name: 'send-message', priority: 999, resources: ['*'], role: 'anonymous', action: 'Deny' },
                    ]
                });
                console.log('Meeting channel type permissions updated');
            } catch (updateError) {
                // If the update fails, we can still proceed as the channel type exists
                console.log('Could not update channel permissions, but channel exists:', updateError.message);
            }
            
            return { success: true };
        } catch (error) {
            // Channel type doesn't exist, create it
            console.log('Creating meeting channel type');
            
            try {
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
                    url_enrichment: false, // Disable for performance as per docs recommendation
                    permissions: [
                        // Allow any authenticated user to read the channel
                        { name: 'read-channel', priority: 999, resources: ['*'], role: 'channel_member', action: 'Allow' },
                        { name: 'read-channel', priority: 999, resources: ['*'], role: 'user', action: 'Allow' },
                        { name: 'read-channel', priority: 999, resources: ['*'], role: 'anonymous', action: 'Deny' },
                        
                        // Allow any authenticated user to send messages
                        { name: 'send-message', priority: 999, resources: ['*'], role: 'channel_member', action: 'Allow' },
                        { name: 'send-message', priority: 999, resources: ['*'], role: 'user', action: 'Allow' },
                        { name: 'send-message', priority: 999, resources: ['*'], role: 'anonymous', action: 'Deny' },
                    ]
                });
                console.log('Successfully created meeting channel type');
            } catch (createError) {
                // Check if the error is because the channel already exists
                if (createError.message && createError.message.includes('channel type meeting already exists')) {
                    console.log('Channel type already exists (detected in create flow)');
                    return { success: true };
                }
                
                // If it's a different error, propagate it
                throw createError;
            }
            
            return { success: true };
        }
    } catch (error) {
        console.error('Failed to ensure meeting channel type exists:', error);
        return { success: false, error: error.message };
    }
}

// Create a chat channel for a meeting
export const createMeetingChatChannel = async (meetingId: string) => {
    const user = await currentUser();
    
    if(!user) throw Error('User not found');
    if(!apiKey) throw Error('No Stream API key provided');
    if(!apiSecret) throw Error('No Stream API secret provided');
    
    // First ensure the meeting channel type exists
    const channelTypeResult = await ensureMeetingChannelType();
    if (!channelTypeResult.success) {
        console.error('Failed to create channel type:', channelTypeResult.error);
        // Don't throw here, try to create the channel anyway
    }
    
    // Server-side client for channel creation
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    
    try {
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
            } catch (memberError) {
                console.log('Error checking/adding channel membership:', memberError.message);
            }
            
            return { channelId: meetingId };
        } catch (queryError) {
            // Channel doesn't exist, create a new one with correct settings
            const channel = serverClient.channel('meeting', meetingId, {
                name: `Meeting Chat ${meetingId}`,
                created_by_id: user.id,
                // Create it with these important settings initially
                access_mode: 'open', // This is the key setting - "open" allows all authenticated users
                auto_translation_enabled: false,
                members: [user.id], // Start with the creator as a member
            });
            
            await channel.create();
            console.log('Created new channel for meeting:', meetingId);
            
            return { channelId: meetingId };
        }
    } catch (error) {
        console.error("Error creating meeting chat channel:", error);
        throw error;
    }
}