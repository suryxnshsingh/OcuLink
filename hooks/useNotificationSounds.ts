import { useCall } from '@stream-io/video-react-sdk';
import { useCallback, useEffect, useRef } from 'react';

// Cache audio elements to avoid recreating them
const audioCache = new Map<string, () => Promise<void>>();

/**
 * Generates a simple tone using Web Audio API as fallback
 * @param frequency - The frequency of the tone in Hz
 * @param duration - The duration in milliseconds
 * @param type - The type of oscillator wave
 * @returns Promise that resolves when the tone finishes playing
 */
const generateTone = (
  frequency: number = 440, 
  duration: number = 200, 
  type: OscillatorType = 'sine'
): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Add fade out
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration / 1000);
      
      oscillator.onended = () => {
        resolve();
      };
    } catch (error) {
      console.warn('Failed to generate tone:', error);
      resolve();
    }
  });
};

/**
 * Play a sound from a URL, caching the audio element
 * Falls back to generating a tone if the audio file can't be loaded
 */
async function playSoundFromUrl(url: string, fallbackOptions?: { 
  frequency: number; 
  duration: number;
  type: OscillatorType;
}) {
  let doPlay = audioCache.get(url);
  
  if (!doPlay) {
    // Wait for an audio file to load
    const canPlayPromise = new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio(url);
      
      audio.addEventListener("canplaythrough", () => resolve(audio), { once: true });
      
      // Handle errors - will fall back to generated tone
      audio.addEventListener("error", (e) => {
        console.warn(`Failed to load audio from ${url}:`, e);
        reject(e);
      }, { once: true });
      
      // Set a timeout in case the file is missing or takes too long
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout loading audio from ${url}`));
      }, 3000);
      
      // Clear timeout if audio loads successfully
      audio.addEventListener("canplaythrough", () => clearTimeout(timeoutId), { once: true });
    });
    
    doPlay = async () => {
      try {
        const audio = await canPlayPromise;
        await audio.play();
      } catch (error) {
        console.warn(`Falling back to generated tone for ${url}`);
        // Fall back to generated tone
        if (fallbackOptions) {
          await generateTone(
            fallbackOptions.frequency, 
            fallbackOptions.duration, 
            fallbackOptions.type
          );
        } else if (url.includes('joined')) {
          // Default join sound: higher pitch, happier sound
          await generateTone(880, 200, 'sine');
        } else {
          // Default leave sound: lower pitch
          await generateTone(440, 200, 'sine');
        }
      }
    };
    
    // Save to cache
    audioCache.set(url, doPlay);
  }
  
  await doPlay();
}

/**
 * Hook for playing notification sounds when participants join or leave a call
 */
export function useNotificationSounds() {
  const call = useCall();
  const isFirstRender = useRef(true);
  
  // We don't want to play the sound when the user joins themself
  const isSelf = useCallback(
    (userId: string) => userId === call?.currentUserId,
    [call],
  );
  
  useEffect(() => {
    // Don't play sounds on initial render (when user themselves joins)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (!call) {
      return;
    }
    
    const unlistenJoin = call.on("call.session_participant_joined", (event) => {
      if (!isSelf(event.participant.user.id)) {
        playSoundFromUrl("/sounds/joined.mp3", { 
          frequency: 880, // Higher, happier tone
          duration: 200,
          type: 'sine'
        });
      }
    });
    
    const unlistenLeft = call.on("call.session_participant_left", (event) => {
      if (!isSelf(event.participant.user.id)) {
        playSoundFromUrl("/sounds/left.mp3", {
          frequency: 440, // Lower, sadder tone
          duration: 200,
          type: 'sine'
        });
      }
    });
    
    return () => {
      unlistenJoin();
      unlistenLeft();
    };
  }, [call, isSelf]);
}

export default useNotificationSounds;