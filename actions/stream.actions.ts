"use server"

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const apiSecret = process.env.NEXT_PUBLIC_STREAM_API_SECRET;

export const tokenProvider = async () => {
    const user = await currentUser()!

    if(!user) throw Error('User not found');
    if(!apiKey) throw Error('No Stream API key provided');
    if(!apiSecret) throw Error('No Stream API secret provided');

    const Client = new StreamClient(apiKey, apiSecret)

    const exp= 60 * 60;

    const issued = Math.floor(Date.now() / 1000) -60 ;
    
    const token = Client.generateUserToken({user_id:user.id, exp});

    return token;
}