import React, { ReactNode} from 'react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
  
interface MeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    className?: string;
    children?: ReactNode;
    handleClick?: () => void;
    buttonText?: string;
    image?: string;
    buttonIcon?: string;
}

const MeetingModal = ({isOpen, onClose, title, className, children, handleClick, buttonText, image, buttonIcon}:
     MeetingModalProps) => {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='flex w-full flex-col gap-6 border-4 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] bg-green-100 '>
            <div className='flex flex-col gap-6'>
              {image && (
                <div className='flex justify-center'>
                  <Image src={image} alt="image" width="72" height="72"/>
                </div>
              )}
              <h1 className={cn("text-3xl font-bold leading-[42px]")}>{title}</h1>
              {children}
              <Button className='bg-green-500 border-2 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)]
              hover: ' onClick={handleClick}>
                {buttonText || "Schedule Meeting"}
                {buttonIcon && (
                  <Image src={buttonIcon} alt="button icon" width="15" height="15"/>
                )} &nbsp;
              </Button>
            </div>
        </DialogContent>
    </Dialog>

  )
}

export default MeetingModal;