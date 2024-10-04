"use client"

import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'

const MeetingTypeList = () => {
  const router = useRouter()
  const [MeetingState, setMeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | 
   undefined >()


  const createMeeting = ()=>{
    
  }

  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
        <HomeCard
          img = "icons/add-meeting.svg"
          title = "New Meeting"
          description = "Start an Instant Meeting"
          handleClick = {() => setMeetingState('isJoiningMeeting')}
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
          isOpen={MeetingState === 'isInstantMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Start an Instant Meeting"
          className = 'text-center'
          buttonText = "Start Meeting"
          handleClick = {createMeeting}
        />
    </section>
  )
}

export default MeetingTypeList