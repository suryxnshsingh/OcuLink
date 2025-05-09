"use client"

import { useCallStateHooks } from "@stream-io/video-react-sdk"
import { useToast } from "@/hooks/use-toast"
import { Camera, Mic, Volume, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

/**
 * Neobrutalist device selector with three dropdowns for switching devices
 * Bold design with playful elements and strong visual hierarchy
 */
const DeviceSelector = () => {
  const { useCameraState, useMicrophoneState, useSpeakerState } = useCallStateHooks()
  const { toast } = useToast()
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({
    camera: false,
    microphone: false,
    speaker: false
  })

  // Camera state management
  const { camera, selectedDevice: selectedCameraDevice, devices: cameraDevices } = useCameraState()

  // Microphone state management
  const { microphone, selectedDevice: selectedMicDevice, devices: micDevices } = useMicrophoneState()

  // Speaker state management
  const {
    speaker,
    selectedDevice: selectedSpeakerDevice,
    devices: speakerDevices,
    isDeviceSelectionSupported: isSpeakerSelectionSupported,
  } = useSpeakerState()

  // Handle camera device selection
  const selectCameraDevice = async (deviceId: string) => {
    try {
      await camera.select(deviceId)
      toast({
        title: "Camera changed",
        description: "Camera device successfully changed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change camera device",
        variant: "destructive",
      })
    }
  }

  // Handle microphone device selection
  const selectMicrophoneDevice = async (deviceId: string) => {
    try {
      await microphone.select(deviceId)
      toast({
        title: "Microphone changed",
        description: "Microphone device successfully changed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change microphone device",
        variant: "destructive",
      })
    }
  }

  // Handle speaker device selection
  const selectSpeakerDevice = async (deviceId: string) => {
    try {
      await speaker.select(deviceId)
      toast({
        title: "Speaker changed",
        description: "Speaker device successfully changed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change speaker device",
        variant: "destructive",
      })
    }
  }

  // Get device name or label
  const getDeviceName = (device: MediaDeviceInfo | undefined) => {
    return device?.label || "Default Device"
  }

  // Find currently selected device in a list
  const findSelectedDevice = (deviceList: MediaDeviceInfo[] | undefined, selectedId: string | undefined) => {
    if (!deviceList || !selectedId) return undefined
    return deviceList.find((d) => d.deviceId === selectedId)
  }

  // Clear hover state when all dropdowns close
  useEffect(() => {
    if (!Object.values(dropdownOpen).some(Boolean)) {
      setHoveredDropdown(null)
    }
  }, [dropdownOpen])

  const handleOpenChange = (type: string, isOpen: boolean) => {
    setDropdownOpen(prev => ({
      ...prev,
      [type]: isOpen
    }))
  }

  return (
    <div className="flex flex-wrap justify-between gap-4 w-full">
      {/* Camera dropdown */}
      <div className="flex-1 min-w-[180px]">
        <DropdownMenu onOpenChange={(open) => handleOpenChange('camera', open)}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              className={cn(
                "relative w-full bg-green-200 border-2 border-black text-black rounded-none px-3",
                "font-medium shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]",
                "hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-green-300",
                "h-auto justify-start transition-all duration-200",
                dropdownOpen.camera && "shadow-[1px_1px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px] bg-green-300"
              )}
              onMouseEnter={() => setHoveredDropdown('camera')}
              onMouseLeave={() => !dropdownOpen.camera && setHoveredDropdown(null)}
            >
              <div className="flex items-center justify-start gap-3 w-full">
                <Camera className="h-5 w-5 text-black flex-shrink-0" strokeWidth={2.5} />
                <span className="text-sm font-medium truncate max-w-[calc(100%-28px)] text-black">
                  {getDeviceName(findSelectedDevice(cameraDevices, selectedCameraDevice))}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] bg-green-200 p-2 min-w-[220px] rounded-none"
            align="start"
          >
            <div className="text-sm font-bold text-black px-2 py-2 border-b-2 border-black mb-2">
              Select Camera
            </div>
            {(!cameraDevices || cameraDevices.length === 0) && (
              <DropdownMenuItem className="text-sm text-black p-2 rounded-none border border-black m-1">
                No cameras found
              </DropdownMenuItem>
            )}
            {cameraDevices &&
              cameraDevices.map((device) => (
                <DropdownMenuItem
                  key={device.deviceId}
                  onClick={() => selectCameraDevice(device.deviceId)}
                  onMouseEnter={() => setHoveredDropdown(`camera-${device.deviceId}`)}
                  onMouseLeave={() => setHoveredDropdown(null)}
                  className={cn(
                    "rounded-none p-2 m-1 cursor-pointer text-sm border transition-all duration-200",
                    selectedCameraDevice === device.deviceId 
                      ? "bg-green-400 text-black border-2 border-black font-bold" 
                      : "hover:bg-green-300 text-black border border-black",
                    hoveredDropdown === `camera-${device.deviceId}` && "translate-y-[-2px]"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate max-w-[180px]">{device.label || "Unnamed camera"}</span>
                    {selectedCameraDevice === device.deviceId && <Check className="h-4 w-4 ml-2" />}
                  </div>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Microphone dropdown */}
      <div className="flex-1 min-w-[180px]">
        <DropdownMenu onOpenChange={(open) => handleOpenChange('microphone', open)}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              className={cn(
                "relative w-full bg-blue-200 border-2 border-black text-black rounded-none px-3",
                "font-medium shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]",
                "hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-blue-300",
                "h-auto justify-start transition-all duration-200",
                dropdownOpen.microphone && "shadow-[1px_1px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px] bg-blue-300"
              )}
              onMouseEnter={() => setHoveredDropdown('microphone')}
              onMouseLeave={() => !dropdownOpen.microphone && setHoveredDropdown(null)}
            >
              <div className="flex items-center justify-start gap-3 w-full">
                <Mic className="h-5 w-5 text-black flex-shrink-0" strokeWidth={2.5} />
                <span className="text-sm font-medium truncate max-w-[calc(100%-28px)] text-black">
                  {getDeviceName(findSelectedDevice(micDevices, selectedMicDevice))}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] bg-blue-200 p-2 min-w-[220px] rounded-none"
            align="start"
          >
            <div className="text-sm font-bold text-black px-2 py-2 border-b-2 border-black mb-2">
              Select Microphone
            </div>
            {(!micDevices || micDevices.length === 0) && (
              <DropdownMenuItem className="text-sm text-black p-2 rounded-none border border-black m-1">
                No microphones found
              </DropdownMenuItem>
            )}
            {micDevices &&
              micDevices.map((device) => (
                <DropdownMenuItem
                  key={device.deviceId}
                  onClick={() => selectMicrophoneDevice(device.deviceId)}
                  onMouseEnter={() => setHoveredDropdown(`mic-${device.deviceId}`)}
                  onMouseLeave={() => setHoveredDropdown(null)}
                  className={cn(
                    "rounded-none p-2 m-1 cursor-pointer text-sm border transition-all duration-200",
                    selectedMicDevice === device.deviceId 
                      ? "bg-blue-400 text-black border-2 border-black font-bold" 
                      : "hover:bg-blue-300 text-black border border-black",
                    hoveredDropdown === `mic-${device.deviceId}` && "translate-y-[-2px]"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate max-w-[180px]">{device.label || "Unnamed microphone"}</span>
                    {selectedMicDevice === device.deviceId && <Check className="h-4 w-4 ml-2" />}
                  </div>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Speaker dropdown (only if supported) */}
      {isSpeakerSelectionSupported && (
        <div className="flex-1 min-w-[180px]">
          <DropdownMenu onOpenChange={(open) => handleOpenChange('speaker', open)}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                className={cn(
                  "relative w-full bg-yellow-200 border-2 border-black text-black rounded-none px-3",
                  "font-medium shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]",
                  "hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-yellow-300",
                  "h-auto justify-start transition-all duration-200",
                  dropdownOpen.speaker && "shadow-[1px_1px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px] bg-yellow-300"
                )}
                onMouseEnter={() => setHoveredDropdown('speaker')}
                onMouseLeave={() => !dropdownOpen.speaker && setHoveredDropdown(null)}
              >
                <div className="flex items-center justify-start gap-3 w-full">
                  <Volume className="h-5 w-5 text-black flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-sm font-medium truncate max-w-[calc(100%-28px)] text-black">
                    {getDeviceName(findSelectedDevice(speakerDevices, selectedSpeakerDevice))}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] bg-yellow-200 p-2 min-w-[220px] rounded-none"
              align="end"
            >
              <div className="text-sm font-bold text-black px-2 py-2 border-b-2 border-black mb-2">
                Select Speaker
              </div>
              {(!speakerDevices || speakerDevices.length === 0) && (
                <DropdownMenuItem className="text-sm text-black p-2 rounded-none border border-black m-1">
                  No speakers found
                </DropdownMenuItem>
              )}
              {speakerDevices &&
                speakerDevices.map((device) => (
                  <DropdownMenuItem
                    key={device.deviceId}
                    onClick={() => selectSpeakerDevice(device.deviceId)}
                    onMouseEnter={() => setHoveredDropdown(`speaker-${device.deviceId}`)}
                    onMouseLeave={() => setHoveredDropdown(null)}
                    className={cn(
                      "rounded-none p-2 m-1 cursor-pointer text-sm border transition-all duration-200",
                      selectedSpeakerDevice === device.deviceId 
                        ? "bg-yellow-400 text-black border-2 border-black font-bold" 
                        : "hover:bg-yellow-300 text-black border border-black",
                      hoveredDropdown === `speaker-${device.deviceId}` && "translate-y-[-2px]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate max-w-[180px]">{device.label || "Unnamed speaker"}</span>
                      {selectedSpeakerDevice === device.deviceId && <Check className="h-4 w-4 ml-2" />}
                    </div>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

export default DeviceSelector
