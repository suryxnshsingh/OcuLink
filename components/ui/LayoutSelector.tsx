"use client"
import type { CallLayoutType } from "@/types/meeting"
import { LayoutList, Sparkles } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

interface LayoutSelectorProps {
  selectedLayout: CallLayoutType
  onLayoutChange: (layout: CallLayoutType) => void
}

const LayoutSelector = ({ selectedLayout, onLayoutChange }: LayoutSelectorProps) => {
  const [hoveredItem, setHoveredItem] = useState<CallLayoutType | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const gridItemRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (hoveredItem === "grid" && gridItemRef.current) {
      const rect = gridItemRef.current.getBoundingClientRect()
      setTooltipPosition({
        top: rect.bottom + 10,
        left: rect.left + rect.width / 2
      })
    }
  }, [hoveredItem])

  const renderTooltip = () => {
    if (!isMounted || hoveredItem !== "grid") return null
    
    return createPortal(
      <div 
        className="fixed bg-red-100 text-xs px-3 py-1.5 rounded-md border border-black text-red-800 whitespace-nowrap z-[9999] transform -translate-x-1/2"
        style={{ 
          top: `${tooltipPosition.top}px`, 
          left: `${tooltipPosition.left}px`,
        }}
      >
        Doesn't support screen share
      </div>,
      document.body
    )
  }

  return (
    <DropdownMenu>
      <div className="flex items-center">
        <DropdownMenuTrigger className="cursor-pointer p-2 bg-green-200 hover:bg-green-300 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <LayoutList size={20} className="text-black" />
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent className="m-4 bg-green-200 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] p-2">
        <div className="grid grid-cols-2 gap-2">
          <DropdownMenuItem
            className="flex flex-col items-center cursor-pointer hover:bg-green-300 py-3 transition-all duration-200"
            onClick={() => onLayoutChange("grid" as CallLayoutType)}
            onMouseEnter={() => setHoveredItem("grid")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="relative" ref={gridItemRef}>
              <div className={`w-24 h-16 border-2 ${hoveredItem === "grid" || selectedLayout === "grid" ? "border-black border-2 ring-4 ring-green-500" : "border-black"} p-1 mb-1 bg-white transition-all duration-200 ${hoveredItem === "grid" ? "translate-y-[-2px]" : ""}`}>
                <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
                  <div className="bg-green-400 border border-black"></div>
                  <div className="bg-green-400 border border-black"></div>
                  <div className="bg-green-400 border border-black"></div>
                  <div className="bg-green-400 border border-black"></div>
                </div>
              </div>
            </div>
            <span className={`text-xs font-medium ${hoveredItem === "grid" ? "text-green-800" : ""} ${selectedLayout === "grid" ? "font-bold" : ""}`}>Grid</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex flex-col items-center cursor-pointer hover:bg-green-300 py-3 transition-all duration-200"
            onClick={() => onLayoutChange("speaker-right" as CallLayoutType)}
            onMouseEnter={() => setHoveredItem("speaker-right")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className={`w-24 h-16 border-2 ${hoveredItem === "speaker-right" || selectedLayout === "speaker-right" ? "border-black border-2 ring-4 ring-green-500" : "border-black"} p-1 mb-1 bg-white transition-all duration-200 ${hoveredItem === "speaker-right" ? "translate-y-[-2px]" : ""}`}>
              <div className="flex h-full gap-1">
                <div className="w-2/3 bg-green-500 border border-black"></div>
                <div className="w-1/3 flex flex-col gap-1">
                  <div className="h-1/3 bg-green-400 border border-black"></div>
                  <div className="h-1/3 bg-green-400 border border-black"></div>
                  <div className="h-1/3 bg-green-400 border border-black"></div>
                </div>
              </div>
            </div>
            <span className={`text-xs font-medium ${hoveredItem === "speaker-right" ? "text-green-800" : ""} ${selectedLayout === "speaker-right" ? "font-bold" : ""}`}>Speaker Left</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex flex-col items-center cursor-pointer hover:bg-green-300 py-3 transition-all duration-200"
            onClick={() => onLayoutChange("speaker-left" as CallLayoutType)}
            onMouseEnter={() => setHoveredItem("speaker-left")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className={`w-24 h-16 border-2 ${hoveredItem === "speaker-left" || selectedLayout === "speaker-left" ? "border-black border-2 ring-4 ring-green-500" : "border-black"} p-1 mb-1 bg-white transition-all duration-200 ${hoveredItem === "speaker-left" ? "translate-y-[-2px]" : ""}`}>
              <div className="flex h-full gap-1">
                <div className="w-1/3 flex flex-col gap-1">
                  <div className="h-1/3 bg-green-400 border border-black"></div>
                  <div className="h-1/3 bg-green-400 border border-black"></div>
                  <div className="h-1/3 bg-green-400 border border-black"></div>
                </div>
                <div className="w-2/3 bg-green-500 border border-black"></div>
              </div>
            </div>
            <span className={`text-xs font-medium ${hoveredItem === "speaker-left" ? "text-green-800" : ""} ${selectedLayout === "speaker-left" ? "font-bold" : ""}`}>Speaker Right</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex flex-col items-center cursor-pointer hover:bg-green-300 py-3 transition-all duration-200"
            onClick={() => onLayoutChange("custom" as CallLayoutType)}
            onMouseEnter={() => setHoveredItem("custom")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className={`w-24 h-16 border-2 ${hoveredItem === "custom" || selectedLayout === "custom" ? "border-black border-2 ring-4 ring-green-500" : "border-black"} p-1 mb-1 bg-white relative transition-all duration-200 ${hoveredItem === "custom" ? "translate-y-[-2px]" : ""}`}>
              <div className="grid grid-cols-3 grid-rows-2 gap-1 h-full">
                <div className="bg-green-400 border border-black col-span-2 row-span-1"></div>
                <div className="bg-green-400 border border-black"></div>
                <div className="bg-green-400 border border-black"></div>
                <div className="bg-green-400 border border-black col-span-2 row-span-1"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <Sparkles size={32} className={`text-yellow-500 fill-yellow-300 ${hoveredItem === "custom" ? "scale-110" : ""} transition-all duration-200`} />
                  <div className={`absolute inset-0 bg-yellow-300/30 blur-sm rounded-full -z-10 ${hoveredItem === "custom" ? "scale-125" : ""} transition-all duration-200`}></div>
                </div>
              </div>
            </div>
            <span className={`text-xs font-medium ${hoveredItem === "custom" ? "text-green-800" : ""} ${selectedLayout === "custom" ? "font-bold" : ""}`}>Smart</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
      {renderTooltip()}
    </DropdownMenu>
  )
}

export default LayoutSelector
