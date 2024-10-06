"use client"

import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from "@/hooks/use-toast"


const MeetingTypeList = () => {
  const router = useRouter()
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
  >(undefined);
  const { user} = useUser();
  const client = useStreamVideoClient();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description : '',
    link : ''
  });
  const [callDetails, setCallDetails] = useState<Call>()
  const { toast } = useToast();
  const createMeeting = async ()=>{
      if(!client || !user) return;
      try{
        if(!values.dateTime){
          toast({title: "Please select Date and Time"});
          return;
        }

        const id = crypto.randomUUID();
        const call = client.call ('default', id);

        if (!call) throw new Error('Call creation failed');

        const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
        const description = values.description || "Instant Meeting";
        await call.getOrCreate({
          data:{
            starts_at : startsAt,
            custom :{
              description
            }
          }
        })

        setCallDetails(call);
        if(!values.description){
          router.push(`/meeting/${call.id}`)
        }
        toast({title: "Meeting created successfully"})

      } catch (error) {
        console.log (error) ;
        toast({title: "Meeting creation failed"})
      }
  }

  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 md:mt-8 max-sm:mt-12'>
        <HomeCard
          img = "icons/add-meeting.svg"
          title = "New Meeting"
          description = "Start an Instant Meeting"
          handleClick = {() => setMeetingState('isInstantMeeting')}
          className = 'bg-orange-500'
        />
        <HomeCard
          img = "icons/schedule.svg"
          title = "Schedule Meeting"
          description = "Schedule a Meeting"
          handleClick = {() => setMeetingState('isScheduleMeeting')}
          className = 'bg-blue-500'
        />
        <HomeCard
          img = "icons/add-meeting.svg"
          title = "Join Meeting"
          description = "via Invitation links"
          handleClick = {() => setMeetingState('isJoiningMeeting')}
          className = 'bg-green-500'
        />
        <HomeCard
          img = "icons/recordings.svg"
          title = "View Recordings"
          description = "Check out your recordings"
          handleClick = {() => router.push("/recordings")}
          className = 'bg-purple-500'
        />

        <MeetingModal
          isOpen={meetingState === 'isInstantMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Start an Instant Meeting"
          className="text-center"
          buttonText="Start Meeting"
          handleClick={createMeeting}
        />
    </section>
  )
}

export default MeetingTypeList