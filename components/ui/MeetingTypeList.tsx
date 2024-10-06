"use client"

import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from "@/hooks/use-toast"
import { Textarea } from './textarea'
import ReactDatePicker from 'react-datepicker'


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

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`

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

        {!callDetails ? (
                <MeetingModal
                  isOpen={meetingState === 'isScheduleMeeting'}
                  onClose={() => setMeetingState(undefined)}
                  title="Create Meeting"
                  handleClick={createMeeting}
                >
                  <div className="flex flex-col gap-2.5">
                    <label className="text-base font-normal leading-[22.4px] text-sky-2">
                      Add a description
                    </label>
                    <Textarea
                      className="border-none bg-white focus-visible:ring-0 focus-visible:ring-offset-0"
                      onChange={(e) =>
                        setValues({ ...values, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex w-full flex-col gap-2.5">
                    <label className="text-base font-normal leading-[22.4px] text-sky-2">
                      Select Date and Time
                    </label>
                    <ReactDatePicker
                      selected={values.dateTime}
                      onChange={(date) => setValues({ ...values, dateTime: date! })}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="time"
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-full rounded bg-white p-2 focus:outline-none"
                    />
                  </div>
                </MeetingModal>
              ) : (
                <MeetingModal
                  isOpen={meetingState === 'isScheduleMeeting'}
                  onClose={() => setMeetingState(undefined)}
                  title="Meeting Created"
                  handleClick={() => {
                    navigator.clipboard.writeText(meetingLink);
                    toast({ title: 'Link Copied' });
                  }}
                  image={'/icons/checked.svg'}
                  buttonIcon="/icons/copy.svg"
                  className="text-center fill-white px-5"
                  buttonText="Copy Meeting Link"
                  
                />
              )}

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