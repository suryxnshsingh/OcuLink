import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Restricted,
  useCall,
  useCallStateHooks,
  useConnectedUser,
} from '@stream-io/video-react-bindings';
import {
  hasAudio,
  hasVideo,
  isPinned,
  name,
  OwnCapability,
  StreamVideoParticipant,
  hasScreenShare,
  hasScreenShareAudio
} from '@stream-io/video-client';
import { cn } from '@/lib/utils';
import { Search, X, ChevronDown, MicOff, VideoOff, Pin, MoreHorizontal, Volume2, Shield } from 'lucide-react';
import { Button } from './button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from './dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ParticipantViewContext } from '@stream-io/video-react-sdk';
import Image from 'next/image';

type NeoBrutalParticipantsListProps = {
  /** Click event listener function to be invoked to dismiss/hide the ParticipantsList */
  onClose: () => void;
  /** Custom function to override the searching logic of active participants */
  activeUsersSearchFn?: (searchQuery: string) => Promise<StreamVideoParticipant[]> | undefined;
  /** Custom function to override the searching logic of blocked users */
  blockedUsersSearchFn?: (searchQuery: string) => Promise<string[]> | undefined;
  /** Interval in ms for debouncing search queries */
  debounceSearchInterval?: number;
};

type UserListType = 'active' | 'blocked';

const DEFAULT_DEBOUNCE_SEARCH_INTERVAL = 200;

export const NeoBrutalParticipantsList = ({
  onClose,
  activeUsersSearchFn,
  blockedUsersSearchFn,
  debounceSearchInterval = DEFAULT_DEBOUNCE_SEARCH_INTERVAL,
}: NeoBrutalParticipantsListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userListType, setUserListType] = useState<UserListType>('active');
  const [activeParticipantsResults, setActiveParticipantsResults] = useState<StreamVideoParticipant[]>([]);
  const [blockedUsersResults, setBlockedUsersResults] = useState<string[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const { toast } = useToast();
  const call = useCall();
  const { useParticipants, useCallBlockedUserIds, useAnonymousParticipantCount } = useCallStateHooks();
  const participants = useParticipants({ sortBy: name });
  const blockedUserIds = useCallBlockedUserIds();
  const anonymousCount = useAnonymousParticipantCount();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle global mute all
  const handleMuteAll = useCallback(() => {
    if (call) {
      call.muteAllUsers('audio');
      toast({
        title: "All participants muted",
        description: "All participants have been muted",
      });
    }
  }, [call, toast]);

  // Handle search input change with debounce
  const handleSearchInputChange = (query: string) => {
    setSearchQuery(query);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set search loading state
    setIsSearchLoading(true);
    
    // Create new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceSearchInterval);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchLoading(false);
    setActiveParticipantsResults([]);
    setBlockedUsersResults([]);
  };
  
  // Perform search based on current user list type
  const performSearch = async (query: string) => {
    if (!query) {
      setIsSearchLoading(false);
      setActiveParticipantsResults([]);
      setBlockedUsersResults([]);
      return;
    }
    
    try {
      if (userListType === 'active') {
        const results = await (activeUsersSearchFn ? 
          activeUsersSearchFn(query) : 
          searchActiveParticipants(query));
        if (results) {
          setActiveParticipantsResults(results);
        }
      } else {
        const results = await (blockedUsersSearchFn ? 
          blockedUsersSearchFn(query) : 
          searchBlockedUsers(query));
        if (results) {
          setBlockedUsersResults(results);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearchLoading(false);
    }
  };
  
  // Default search function for active participants
  const searchActiveParticipants = (query: string): Promise<StreamVideoParticipant[]> => {
    const queryRegExp = new RegExp(query, 'i');
    return Promise.resolve(
      participants.filter((participant) => {
        return participant.name?.match(queryRegExp) || participant.userId.match(queryRegExp);
      }),
    );
  };
  
  // Default search function for blocked users
  const searchBlockedUsers = (query: string): Promise<string[]> => {
    const queryRegExp = new RegExp(query, 'i');
    return Promise.resolve(
      blockedUserIds.filter((blockedUser) => {
        return blockedUser.match(queryRegExp);
      }),
    );
  };
  
  // Effect to reset results when switching list types
  useEffect(() => {
    setActiveParticipantsResults([]);
    setBlockedUsersResults([]);
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [userListType]);
  
  // Get the participants list to display based on search state
  const activeParticipantsToShow = searchQuery ? activeParticipantsResults : participants;
  const blockedUsersToShow = searchQuery ? blockedUsersResults : blockedUserIds;
  
  return (
    <div className="flex flex-col h-full overflow-scroll bg-green-200">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b-2 border-black bg-green-300">
        <div className="flex flex-col">
          <div className="flex items-center">
            <h2 className="font-bold text-lg">Participants</h2>
            <span className="ml-2 px-2 py-0.5 bg-green-50 border-2 border-black rounded-full text-xs font-bold">
              {participants.length}
            </span>
            {anonymousCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-300 border-2 border-black rounded-full text-xs font-bold">
                +{anonymousCount} anonymous
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-red-300 hover:bg-red-400 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search bar */}
      <div className="p-3 border-b-2 border-black">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border-2 border-black bg-white rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          {searchQuery && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={clearSearch}
            >
              <X size={18} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b-2 border-black">
        <button 
          onClick={() => setUserListType('active')}
          className={cn(
            'flex-1 py-3 font-medium text-center',
            userListType === 'active' 
              ? 'bg-green-300 border-r-2 border-black' 
              : 'bg-green-100 hover:bg-green-200 border-r-2 border-black'
          )}
        >
          Active Users
        </button>
        <button 
          onClick={() => setUserListType('blocked')}
          className={cn(
            'flex-1 py-3 font-medium text-center',
            userListType === 'blocked' 
              ? 'bg-green-300' 
              : 'bg-green-100 hover:bg-green-200'
          )}
        >
          Blocked Users
        </button>
      </div>
      
      {/* Mute all users button (for owners/admins) */}
      {userListType === 'active' && (
        <Restricted requiredGrants={[OwnCapability.MUTE_USERS]} hasPermissionsOnly>
          <div className="p-3 border-b-2 border-black">
            <button
              onClick={handleMuteAll}
              className="w-full py-2 bg-yellow-300 hover:bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-medium flex items-center justify-center"
            >
              <MicOff size={16} className="mr-2" />
              Mute All Participants
            </button>
          </div>
        </Restricted>
      )}
      
      {/* Participants list */}
      <div className="flex-1 overflow-y-auto">
        {userListType === 'active' ? (
          <ActiveParticipantsList 
            participants={activeParticipantsToShow} 
            isLoading={isSearchLoading}
            noResultsText={searchQuery ? "No participants found" : "No participants in this meeting"}
          />
        ) : (
          <BlockedUsersList 
            blockedUsers={blockedUsersToShow}
            isLoading={isSearchLoading}
            noResultsText={searchQuery ? "No blocked users found" : "No blocked users"}
          />
        )}
      </div>
    </div>
  );
};

// Component for displaying active participants
type ActiveParticipantsListProps = {
  participants: StreamVideoParticipant[];
  isLoading: boolean;
  noResultsText: string;
};

const ActiveParticipantsList = ({ participants, isLoading, noResultsText }: ActiveParticipantsListProps) => {
  if (isLoading) {
    return <LoadingIndicator />;
  }
  
  if (!participants.length) {
    return <EmptyResultsList text={noResultsText} />;
  }
  
  return (
    <div className="divide-y-2 divide-black/20">
      {participants.map((participant) => (
        <ParticipantListItem 
          key={participant.sessionId} 
          participant={participant} 
        />
      ))}
    </div>
  );
};

// Component for displaying blocked users
type BlockedUsersListProps = {
  blockedUsers: string[];
  isLoading: boolean;
  noResultsText: string;
};

const BlockedUsersList = ({ blockedUsers, isLoading, noResultsText }: BlockedUsersListProps) => {
  const call = useCall();
  
  if (isLoading) {
    return <LoadingIndicator />;
  }
  
  if (!blockedUsers.length) {
    return <EmptyResultsList text={noResultsText} />;
  }
  
  const handleUnblock = (userId: string) => {
    if (call) {
      call.unblockUser(userId);
    }
  };
  
  return (
    <div className="divide-y-2 divide-black/20">
      {blockedUsers.map((userId) => (
        <div key={userId} className="flex items-center justify-between p-4 hover:bg-green-100">
          <div className="font-medium truncate">{userId}</div>
          <Restricted requiredGrants={[OwnCapability.BLOCK_USERS]}>
            <button
              onClick={() => handleUnblock(userId)}
              className="px-3 py-1 bg-blue-200 hover:bg-blue-300 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] text-sm font-medium"
            >
              Unblock
            </button>
          </Restricted>
        </div>
      ))}
    </div>
  );
};

// Individual participant list item
const ParticipantListItem = ({ participant }: { participant: StreamVideoParticipant }) => {
  const connectedUser = useConnectedUser();
  const isCurrentUser = participant.userId === connectedUser?.id;
  const isAudioOn = hasAudio(participant);
  const isVideoOn = hasVideo(participant);
  const isPinnedOn = isPinned(participant);
  
  // Generate display name
  const displayName = isCurrentUser
    ? `${participant.name || participant.userId} (Me)`
    : participant.name || participant.userId || 'Unknown';
  
  return (
    <div className="flex items-center justify-between p-4 hover:bg-green-100 overflow-scroll">
      <div className="flex items-center flex-1 min-w-0">
        {/* Avatar or placeholder */}
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-blue-200">
          {participant.image ? (
            <Image 
              src={participant.image}
              alt={participant.name || ""}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-blue-200 font-bold">
              {(participant.name || participant.userId || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        {/* Name and status */}
        <div className="ml-3 min-w-0 flex-1">
          <div className="flex items-center">
            <span className="font-medium truncate" title={displayName}>
              {displayName}
            </span>
            {isCurrentUser && (
              <span className="ml-2 px-1.5 py-0.5 bg-green-300 border border-black text-xs font-bold rounded">
                You
              </span>
            )}
            {participant.roles?.includes('admin') && (
              <span className="ml-1 flex items-center" title="Admin">
                <Shield size={14} className="text-blue-700" />
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Status indicators */}
      <div className="flex items-center space-x-3">
        {/* Audio status */}
        <div 
          className={`p-1 rounded-full ${isAudioOn ? 'bg-green-300' : 'bg-red-300'} border border-black`}
          title={isAudioOn ? 'Microphone on' : 'Microphone off'}
        >
          {isAudioOn ? <Volume2 size={16} /> : <MicOff size={16} />}
        </div>
        
        {/* Video status */}
        <div 
          className={`p-1 rounded-full ${isVideoOn ? 'bg-green-300' : 'bg-red-300'} border border-black`}
          title={isVideoOn ? 'Camera on' : 'Camera off'}
        >
          {isVideoOn ? <video className="w-4 h-4" /> : <VideoOff size={16} />}
        </div>
        
        {/* Pinned indicator */}
        {isPinnedOn && (
          <div 
            className="p-1 rounded-full bg-yellow-300 border border-black"
            title="Pinned"
          >
            <Pin size={16} />
          </div>
        )}
        
        {/* Actions menu */}
        <ParticipantActionsMenu participant={participant} />
      </div>
    </div>
  );
};

// Participant actions menu
const ParticipantActionsMenu = ({ participant }: { participant: StreamVideoParticipant }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuMaxHeight, setMenuMaxHeight] = useState<number | undefined>(undefined);
  const [menuPosition, setMenuPosition] = useState<{ top?: number, bottom?: number, right: number }>({ right: 0 });

  // Calculate menu position and max height based on available space
  useEffect(() => {
    if (menuOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceAbove = buttonRect.top;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      
      // Check if there's more space below or above the button
      if (spaceBelow > spaceAbove) {
        // Position menu below the button
        setMenuPosition({
          top: buttonRect.bottom + 5,
          right: window.innerWidth - buttonRect.right
        });
        setMenuMaxHeight(viewportHeight - buttonRect.bottom - 20); // 20px padding
      } else {
        // Position menu above the button
        setMenuPosition({
          bottom: viewportHeight - buttonRect.top + 5,
          right: window.innerWidth - buttonRect.right
        });
        setMenuMaxHeight(buttonRect.top - 20); // 20px padding
      }
    }
  }, [menuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuOpen]);

  // Add resize listener to update menu position when window is resized
  useEffect(() => {
    if (!menuOpen) return;
    
    const handleResize = () => {
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - buttonRect.bottom;
        
        if (menuPosition.top) {
          // Menu is positioned below button
          setMenuPosition({
            top: buttonRect.bottom + 5,
            right: window.innerWidth - buttonRect.right
          });
          setMenuMaxHeight(spaceBelow - 20);
        } else {
          // Menu is positioned above button
          setMenuPosition({
            bottom: viewportHeight - buttonRect.top + 5,
            right: window.innerWidth - buttonRect.right
          });
          setMenuMaxHeight(buttonRect.top - 20);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen, menuPosition]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-1 bg-green-200 hover:bg-green-300 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
        aria-label="More actions"
      >
        <MoreHorizontal size={16} />
      </button>
      
      {menuOpen && (
        <div 
          ref={menuRef}
          className="fixed z-[9999] w-48 bg-green-200 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] overflow-auto"
          style={{
            maxHeight: menuMaxHeight,
            ...menuPosition
          }}
        >
          <ParticipantViewContext.Provider value={{ 
            participant, 
            trackType: 'none',
            participantViewElement: null,
            videoElement: null
          }}>
            <div className="py-1">
              <ParticipantMenuItems participant={participant} onClose={() => setMenuOpen(false)} />
            </div>
          </ParticipantViewContext.Provider>
        </div>
      )}
    </div>
  );
};

// Custom implementation of participant menu items
const ParticipantMenuItems = ({ 
  participant, 
  onClose 
}: { 
  participant: StreamVideoParticipant; 
  onClose: () => void;
}) => {
  const call = useCall();
  const { toast } = useToast();
  const { pin, sessionId, userId } = participant;
  
  // Get track states
  const isAudioOn = hasAudio(participant);
  const isVideoOn = hasVideo(participant);
  const hasScreenShareTrack = hasScreenShare(participant);
  const hasScreenShareAudioTrack = hasScreenShareAudio(participant);
  
  // State for fullscreen and PiP modes
  const [fullscreenModeOn, setFullscreenModeOn] = useState(!!document.fullscreenElement);
  const [pictureInPictureElement, setPictureInPictureElement] = useState<Element | null>(
    document.pictureInPictureElement
  );
  
  // Reference to the video element and participant container for this participant
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [participantContainer, setParticipantContainer] = useState<Element | null>(null);
  
  // Effect for fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreenModeOn(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Effect for Picture-in-Picture
  useEffect(() => {
    if (!videoElement) return;
    
    const handlePiP = () => {
      setPictureInPictureElement(document.pictureInPictureElement);
    };
    
    videoElement.addEventListener('enterpictureinpicture', handlePiP);
    videoElement.addEventListener('leavepictureinpicture', handlePiP);
    
    return () => {
      videoElement.removeEventListener('enterpictureinpicture', handlePiP);
      videoElement.removeEventListener('leavepictureinpicture', handlePiP);
    };
  }, [videoElement]);
  
  // Find video element and participant container for this participant
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // More robust approach to find the participant's video element and container
    // Look for elements with data attributes that include the participant ID
    const containers = document.querySelectorAll('.str-video__participant-view');
    let foundVideo: HTMLVideoElement | null = null;
    let foundContainer: Element | null = null;
    
    containers.forEach((container) => {
      // Look for any identifying data that matches this participant
      const videoElements = container.querySelectorAll('video');
      const participantIdElement = container.querySelector(`[data-participant-id="${participant.sessionId}"]`);
      const userIdElement = container.querySelector(`[data-user-id="${participant.userId}"]`);
      
      if (participantIdElement || userIdElement) {
        foundContainer = container;
        
        // If we found the container, get the video element
        if (videoElements.length > 0) {
          foundVideo = videoElements[0] as HTMLVideoElement;
        }
        
        // Break once found
        return;
      }
    });
    
    // If the above didn't work, try another approach - look for any video with the participant ID as data attribute
    if (!foundVideo) {
      const allVideos = document.querySelectorAll('video');
      allVideos.forEach((video) => {
        const participantId = video.getAttribute('data-participant-id');
        if (participantId === participant.sessionId) {
          foundVideo = video;
          // Find the containing participant view
          foundContainer = video.closest('.str-video__participant-view') || video.parentElement;
        }
      });
    }
    
    // If still not found, look for elements containing the participant name or user ID in text
    if (!foundContainer) {
      containers.forEach((container) => {
        const textContent = container.textContent?.toLowerCase() || '';
        const nameToCheck = (participant.name || participant.userId || '').toLowerCase();
        
        if (textContent.includes(nameToCheck)) {
          foundContainer = container;
          const videos = container.querySelectorAll('video');
          if (videos.length > 0) {
            foundVideo = videos[0] as HTMLVideoElement;
          }
        }
      });
    }
    
    if (foundVideo) {
      setVideoElement(foundVideo);
    }
    
    if (foundContainer) {
      setParticipantContainer(foundContainer);
    }
    
  }, [participant.sessionId, participant.userId, participant.name]);
  
  // Participant actions
  const blockUser = () => {
    if (call) {
      call.blockUser(userId);
      toast({
        title: "User blocked",
        description: `${participant.name || userId} has been blocked`,
      });
      onClose();
    }
  };
  
  const muteAudio = () => {
    if (call) {
      call.muteUser(userId, 'audio');
      toast({
        title: "Audio muted",
        description: `${participant.name || userId}'s audio has been muted`,
      });
      onClose();
    }
  };
  
  const muteVideo = () => {
    if (call) {
      call.muteUser(userId, 'video');
      toast({
        title: "Video turned off",
        description: `${participant.name || userId}'s video has been turned off`,
      });
      onClose();
    }
  };
  
  const muteScreenShare = () => {
    if (call) {
      call.muteUser(userId, 'screenshare');
      toast({
        title: "Screen share turned off",
        description: `${participant.name || userId}'s screen share has been turned off`,
      });
      onClose();
    }
  };
  
  const muteScreenShareAudio = () => {
    if (call) {
      call.muteUser(userId, 'screenshare_audio');
      toast({
        title: "Screen share audio muted",
        description: `${participant.name || userId}'s screen share audio has been muted`,
      });
      onClose();
    }
  };
  
  const toggleParticipantPin = () => {
    if (call) {
      if (pin) {
        call.unpin(sessionId);
        toast({
          title: "Unpinned",
          description: `${participant.name || userId} has been unpinned`,
        });
      } else {
        call.pin(sessionId);
        toast({
          title: "Pinned",
          description: `${participant.name || userId} has been pinned`,
        });
      }
      onClose();
    }
  };

  const pinForEveryone = () => {
    if (call) {
      call.pinForEveryone({
        user_id: userId,
        session_id: sessionId,
      }).catch((err) => {
        console.error(`Failed to pin participant ${userId}`, err);
        toast({
          title: "Error",
          description: "Failed to pin participant for everyone",
          variant: "destructive"
        });
      });
      toast({
        title: "Pinned for everyone",
        description: `${participant.name || userId} has been pinned for everyone`,
      });
      onClose();
    }
  };

  const unpinForEveryone = () => {
    if (call) {
      call.unpinForEveryone({
        user_id: userId,
        session_id: sessionId,
      }).catch((err) => {
        console.error(`Failed to unpin participant ${userId}`, err);
        toast({
          title: "Error",
          description: "Failed to unpin participant for everyone",
          variant: "destructive"
        });
      });
      toast({
        title: "Unpinned for everyone",
        description: `${participant.name || userId} has been unpinned for everyone`,
      });
      onClose();
    }
  };
  
  // Full screen toggle
  const toggleFullscreenMode = () => {
    if (!fullscreenModeOn) {
      // First try the participant container
      if (participantContainer) {
        participantContainer.requestFullscreen()
          .then(() => {
            toast({
              title: "Fullscreen mode enabled",
              description: `${participant.name || userId}'s video is now fullscreen`,
            });
          })
          .catch((error) => {
            console.error('Failed to enter fullscreen mode:', error);
            
            // If that fails, try the video element directly
            if (videoElement) {
              videoElement.requestFullscreen().catch((err) => {
                console.error('Video fullscreen failed too:', err);
                toast({
                  title: "Fullscreen failed",
                  description: "Unable to enter fullscreen mode",
                  variant: "destructive"
                });
              });
            } else {
              toast({
                title: "Fullscreen failed",
                description: "Unable to enter fullscreen mode - no video element found",
                variant: "destructive"
              });
            }
          });
      } 
      // If we don't have a container but have a video element
      else if (videoElement) {
        videoElement.requestFullscreen().catch((err) => {
          console.error('Video fullscreen failed:', err);
          toast({
            title: "Fullscreen failed",
            description: "Unable to enter fullscreen mode",
            variant: "destructive"
          });
        });
      } else {
        // Find any participant container with this participant's ID
        const participantDiv = document.querySelector(`[data-participant-id="${participant.sessionId}"]`);
        if (participantDiv) {
          const closestContainer = participantDiv.closest('.str-video__participant-view') || participantDiv;
          closestContainer.requestFullscreen().catch(console.error);
        } else {
          toast({
            title: "Fullscreen failed",
            description: "Unable to find participant's video element",
            variant: "destructive"
          });
        }
      }
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
        .then(() => {
          toast({
            title: "Fullscreen mode exited",
            description: "Video is no longer in fullscreen mode",
          });
        })
        .catch(console.error);
    }
    
    onClose();
  };
  
  // Picture-in-Picture toggle
  const togglePictureInPicture = () => {
    if (!videoElement) {
      toast({
        title: "PiP mode failed",
        description: "Unable to find video element for picture-in-picture mode",
        variant: "destructive"
      });
      onClose();
      return;
    }
    
    if (pictureInPictureElement !== videoElement) {
      videoElement.requestPictureInPicture()
        .then(() => {
          toast({
            title: "Picture-in-Picture enabled",
            description: `${participant.name || userId}'s video is now in PiP mode`,
          });
        })
        .catch((err) => {
          console.error('Failed to enter PiP mode:', err);
          toast({
            title: "PiP failed",
            description: "Unable to enter picture-in-picture mode",
            variant: "destructive"
          });
        });
    } else {
      document.exitPictureInPicture()
        .then(() => {
          toast({
            title: "Picture-in-Picture disabled",
            description: "Video is no longer in PiP mode",
          });
        })
        .catch((err) => {
          console.error('Failed to exit PiP mode:', err);
          toast({
            title: "PiP exit failed",
            description: "Unable to exit picture-in-picture mode",
            variant: "destructive"
          });
        });
    }
    
    onClose();
  };
  
  // Permission management
  const grantPermission = (permission: string) => () => {
    if (call) {
      call.updateUserPermissions({
        user_id: userId,
        grant_permissions: [permission],
      });
      toast({
        title: "Permission granted",
        description: `${permission} permission granted to ${participant.name || userId}`,
      });
      onClose();
    }
  };
  
  const revokePermission = (permission: string) => () => {
    if (call) {
      call.updateUserPermissions({
        user_id: userId,
        revoke_permissions: [permission],
      });
      toast({
        title: "Permission revoked",
        description: `${permission} permission revoked from ${participant.name || userId}`,
      });
      onClose();
    }
  };

  // Toggle permissions dropdown
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const togglePermissions = () => {
    setPermissionsOpen(!permissionsOpen);
  };

  // Menu item component for consistent styling
  const MenuItem = ({ onClick, icon, label, disabled = false }: { 
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;
  }) => (
    <button
      className={cn(
        "w-full px-4 py-2 text-left flex items-center hover:bg-green-300 text-sm",
        disabled ? "opacity-50 cursor-not-allowed" : ""
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span className="w-5 h-5 mr-2 flex items-center justify-center">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className='overflow-scroll h-auto'> 
      {/* Pin actions - dynamic display based on current state */}
      {pin ? (
        // Only show unpin if this is a local pin (not set by someone else)
        pin.isLocalPin && (
          <MenuItem 
            onClick={toggleParticipantPin} 
            icon={<Pin size={14} />} 
            label="Unpin" 
          />
        )
      ) : (
        // Show pin option when not pinned
        <MenuItem 
          onClick={toggleParticipantPin} 
          icon={<Pin size={14} />} 
          label="Pin" 
        />
      )}
      
      <Restricted requiredGrants={[OwnCapability.PIN_FOR_EVERYONE]}>
        {/* Only show "Pin for everyone" if not already pinned for everyone */}
        {!pin || pin.isLocalPin ? (
          <MenuItem 
            onClick={pinForEveryone} 
            icon={<Pin size={14} />} 
            label="Pin for everyone"
          />
        ) : null}
        
        {/* Only show "Unpin for everyone" if currently pinned for everyone */}
        {pin && !pin.isLocalPin ? (
          <MenuItem 
            onClick={unpinForEveryone} 
            icon={<Pin size={14} />} 
            label="Unpin for everyone"
          />
        ) : null}
      </Restricted>
      
      {/* User blocking */}
      <Restricted requiredGrants={[OwnCapability.BLOCK_USERS]}>
        <MenuItem 
          onClick={blockUser} 
          icon={<X size={14} />} 
          label="Block" 
        />
      </Restricted>
      
      {/* Media controls */}
      <Restricted requiredGrants={[OwnCapability.MUTE_USERS]}>
        {isVideoOn && (
          <MenuItem 
            onClick={muteVideo} 
            icon={<VideoOff size={14} />} 
            label="Turn off video" 
          />
        )}
        
        {hasScreenShareTrack && (
          <MenuItem 
            onClick={muteScreenShare} 
            icon={
              <div className="flex items-center justify-center">
                <VideoOff size={14} />
              </div>
            } 
            label="Turn off screen share" 
          />
        )}
        
        {isAudioOn && (
          <MenuItem 
            onClick={muteAudio} 
            icon={<MicOff size={14} />} 
            label="Mute audio" 
          />
        )}
        
        {hasScreenShareAudioTrack && (
          <MenuItem 
            onClick={muteScreenShareAudio} 
            icon={<MicOff size={14} />} 
            label="Mute screen share audio" 
          />
        )}
      </Restricted>
      
      {/* Fullscreen toggle */}
      <MenuItem 
        onClick={toggleFullscreenMode} 
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={fullscreenModeOn 
              ? "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" 
              : "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"} 
              fill="currentColor"/>
          </svg>
        }
        label={`${fullscreenModeOn ? 'Exit' : 'Enter'} fullscreen`}
      />
      
      {/* Picture-in-Picture (only show if video element exists and browser supports it) */}
      {videoElement && document.pictureInPictureEnabled && (
        <MenuItem 
          onClick={togglePictureInPicture} 
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z" fill="currentColor"/>
            </svg>
          }
          label={`${pictureInPictureElement === videoElement ? 'Exit' : 'Enter'} PiP`}
        />
      )}
      
      {/* Permissions management - collapsible dropdown */}
      <Restricted requiredGrants={[OwnCapability.UPDATE_CALL_PERMISSIONS]}>
        <div className="border-t border-black/10">
          <button 
            onClick={togglePermissions}
            className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-green-300 text-sm font-medium"
          >
            <div className="flex items-center">
              <span className="w-5 h-5 mr-2 flex items-center justify-center">
                <Shield size={14} />
              </span>
              Permissions
            </div>
            <ChevronDown 
              size={16} 
              className={cn(
                "transition-transform duration-200",
                permissionsOpen ? "transform rotate-180" : ""
              )} 
            />
          </button>
          
          {permissionsOpen && (
            <div className="bg-green-100 border-t border-black/10 py-1">
              <MenuItem 
                onClick={grantPermission(OwnCapability.SEND_AUDIO)} 
                icon={<Volume2 size={14} />} 
                label="Allow audio" 
              />
              <MenuItem 
                onClick={grantPermission(OwnCapability.SEND_VIDEO)} 
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z"/>
                  </svg>
                } 
                label="Allow video" 
              />
              <MenuItem 
                onClick={grantPermission(OwnCapability.SCREENSHARE)} 
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zm-7-3.53v-2.19c-2.78 0-4.61.85-6 2.72.56-2.67 2.11-5.33 6-5.87V7l4 3.73-4 3.74z"/>
                  </svg>
                } 
                label="Allow screen sharing" 
              />
              
              <MenuItem 
                onClick={revokePermission(OwnCapability.SEND_AUDIO)} 
                icon={<MicOff size={14} />} 
                label="Disable audio" 
              />
              <MenuItem 
                onClick={revokePermission(OwnCapability.SEND_VIDEO)} 
                icon={<VideoOff size={14} />} 
                label="Disable video" 
              />
              <MenuItem 
                onClick={revokePermission(OwnCapability.SCREENSHARE)} 
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.79 18l2 2H24v-2h-2.21zM1.11 2.98l1.55 1.56c-.41.37-.66.89-.66 1.48V16c0 1.1.9 2 2.01 2H0v2h18.13l2.71 2.71 1.41-1.41L2.52 1.57 1.11 2.98zM4 6.02h.13l4.95 4.93C7.94 12.07 7.31 13.52 7 15c.96-1.29 2.13-2.08 3.67-2.46l3.46 3.48H4v-10zm16 0v10.19l1.3 1.3c.42-.37.7-.89.7-1.49v-10c0-1.11-.9-2-2-2H7.8l2 2H20zm-7.07 3.13l2.79 2.78 1.28-1.2L13 7v2.13l-.07.02z"/>
                  </svg>
                } 
                label="Disable screen sharing" 
              />
            </div>
          )}
        </div>
      </Restricted>
    </div>
  );
};

// Loading indicator component
const LoadingIndicator = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
  </div>
);

// Empty results component
const EmptyResultsList = ({ text }: { text: string }) => (
  <div className="flex justify-center items-center p-8 text-gray-500">
    {text}
  </div>
);