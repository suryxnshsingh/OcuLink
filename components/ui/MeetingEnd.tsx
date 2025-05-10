import React, { useEffect, useState } from 'react';
import NeoBrutalismBackground from '@/components/ui/NeoBrutalismBackground'
import { useRouter } from 'next/navigation';
import { Button } from './button';
import { cn } from '@/lib/utils';

type MeetingEndProps = {
  redirectUrl?: string;
  timeoutSeconds?: number;
}

// Separate component for countdown logic to prevent re-rendering the entire tree
const CountdownTimer = ({ 
  seconds, 
  onComplete 
}: { 
  seconds: number; 
  onComplete: () => void 
}) => {
  const [countdown, setCountdown] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <p className="text-sm text-black">
      Redirecting to home in <span className="font-bold">{countdown}</span> seconds
    </p>
  );
};

const MeetingEnd = ({ 
  redirectUrl = '/', 
  timeoutSeconds = 30
}: MeetingEndProps) => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push(redirectUrl);
  };

  return (
    <NeoBrutalismBackground>
        <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
          <div className={cn(
            'flex flex-col items-center gap-4 p-10 rounded-xl',
            'bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]',
            'animate-in fade-in-50 duration-300'
          )}>
            <h1 className="text-2xl font-bold">Call Ended</h1>
            <p className="text-gray-600">Thank you for joining the meeting</p>
            
            <div className="mt-4 flex flex-col gap-4 w-full">
              <CountdownTimer seconds={timeoutSeconds} onComplete={handleGoHome} />
              <Button onClick={handleGoHome} className="w-full bg-red-500 border-2 border-black text-white font-semibold shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                Return to Home Now
              </Button>
            </div>
          </div>
        </div>
      </NeoBrutalismBackground>
  );
};

export default MeetingEnd;