import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './button';
import { cn } from '@/lib/utils';

type MeetingEndProps = {
  redirectUrl?: string;
  timeoutSeconds?: number;
}

const MeetingEnd = ({ 
  redirectUrl = '/', 
  timeoutSeconds = 30 
}: MeetingEndProps) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(timeoutSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(redirectUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, redirectUrl]);

  const handleGoHome = () => {
    router.push(redirectUrl);
  };

  return (
    <section className='relative h-screen w-full flex flex-col items-center justify-center gap-6 overflow-hidden bg-green-50 bg-grid-small-black/[0.2]'>
      <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
        <div className={cn(
          'flex flex-col items-center gap-4 p-8',
          'bg-green-200 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]',
          'animate-in fade-in-50 duration-300'
        )}>
          <h1 className="text-2xl font-bold">Call Ended</h1>
          <p className="text-gray-600">Thank you for joining the meeting</p>
          
          <div className="mt-4 flex flex-col gap-4 w-full">
            <p className="text-sm text-black">
              Redirecting to home in <span className="font-bold">{countdown}</span> seconds
            </p>
            <Button onClick={handleGoHome} className="w-full bg-green-300 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]">
              Return to Home Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetingEnd;