"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  CallStatsReport, 
  AggregatedStatsReport 
} from '@stream-io/video-client';
import { useCallStateHooks } from '@stream-io/video-react-bindings';
import { 
  Activity, 
  Wifi, 
  Radio, 
  Monitor, 
  Download, 
  Upload, 
  HelpCircle,
  ArrowRight,
  ArrowDown,
  Signal,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | React.ReactNode;
  icon: React.ReactNode;
  color?: string;
  className?: string;
}

const StatCard = ({ title, value, icon, color = 'bg-green-200', className }: StatCardProps) => {
  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "flex flex-col border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all",
        color
      )}>
        <div className="flex items-center border-b-2 border-black p-1.5">
          <div className="bg-white rounded-full p-1 border-2 border-black mr-1.5">
            {icon}
          </div>
          <h3 className="font-bold text-xs">{title}</h3>
        </div>
        <div className="p-2 font-mono text-xs font-medium truncate">{value}</div>
      </div>
    </div>
  );
};

const CircularProgressBar = ({ 
  percentage, 
  size = 50, 
  strokeWidth = 6,
  status 
}: { 
  percentage: number; 
  size?: number; 
  strokeWidth?: number; 
  status: 'good' | 'ok' | 'bad' 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const statusColors = {
    good: { bg: '#86EFAC', ring: '#22C55E' },  // Green
    ok: { bg: '#FDE68A', ring: '#F59E0B' },    // Yellow
    bad: { bg: '#FECACA', ring: '#EF4444' }    // Red
  };
  
  const colors = statusColors[status];
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={colors.bg}
          fill="none"
        />
        {/* Foreground circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={colors.ring}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold text-xs">
        {percentage}%
      </div>
    </div>
  );
};

const calculateLatencyPercentage = (latency: number): {percentage: number, status: 'good' | 'ok' | 'bad'} => {
  // Convert latency to percentage (0-100) where 0ms = 100% and 500ms+ = 0%
  // Inverted so lower latency = higher percentage (better)
  const maxLatency = 500; // Consider anything over 500ms as 0%
  const percentage = Math.max(0, 100 - (latency / maxLatency * 100));
  
  let status: 'good' | 'ok' | 'bad';
  if (latency < 75) status = 'good';
  else if (latency < 200) status = 'ok';
  else status = 'bad';
  
  return { percentage: Math.round(percentage), status };
};

const NeoBrutalCallStats = () => {
  const { useCallStatsReport } = useCallStateHooks();
  const callStatsReport = useCallStatsReport();
  const [expanded, setExpanded] = useState(false);
  const [previousStats, setPreviousStats] = useState<CallStatsReport | null>(null);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const [publishBitrate, setPublishBitrate] = useState('-');
  const [subscribeBitrate, setSubscribeBitrate] = useState('-');
  const startTimeRef = useRef<Date | null>(null);
  
  // Set the start time of the call
  useEffect(() => {
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }
  }, []);
  
  // Track call duration elapsed from start time
  const [duration, setDuration] = useState("00:00");
  useEffect(() => {
    if (startTimeRef.current) {
      const timer = setInterval(() => {
        const now = new Date();
        const durationMs = now.getTime() - startTimeRef.current!.getTime();
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        setDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [startTimeRef.current]);
  
  // Update stats when they change
  useEffect(() => {
    if (!callStatsReport) return;
    
    // Save current stats to calculate bitrates
    if (previousStats) {
      // Calculate bitrates
      const timeDiff = (callStatsReport.timestamp - previousStats.timestamp) / 1000; // in seconds
      
      if (timeDiff > 0) {
        // Publisher bitrate
        const publishBytesSent = callStatsReport.publisherStats.totalBytesSent - previousStats.publisherStats.totalBytesSent;
        const publishBitrateValue = (publishBytesSent * 8) / timeDiff / 1000; // kbps
        setPublishBitrate(`${publishBitrateValue.toFixed(1)} kbps`);
        
        // Subscriber bitrate
        const subscribeBytesReceived = callStatsReport.subscriberStats.totalBytesReceived - previousStats.subscriberStats.totalBytesReceived;
        const subscribeBitrateValue = (subscribeBytesReceived * 8) / timeDiff / 1000; // kbps
        setSubscribeBitrate(`${subscribeBitrateValue.toFixed(1)} kbps`);
      }
    }
    
    // Update latency history with valid values only
    const latency = callStatsReport.publisherStats.averageRoundTripTimeInMs;
    if (latency > 0) {
      setLatencyHistory(prev => {
        const newHistory = [...prev, latency];
        // Keep only the last 10 measurements
        return newHistory.length > 10 ? newHistory.slice(-10) : newHistory;
      });
    }
    
    // Save current stats for next comparison
    setPreviousStats(callStatsReport);
  }, [callStatsReport]);
  
  // Determine quality status and color
  const getQualityStatus = (latency: number) => {
    if (latency < 75) return { text: 'Good', color: 'bg-green-200 border-green-500' };
    if (latency < 200) return { text: 'OK', color: 'bg-yellow-200 border-yellow-500' };
    return { text: 'Bad', color: 'bg-red-200 border-red-500' };
  };
  
  // Calculate latency percentage for the gauge
  const latencyValue = callStatsReport?.publisherStats.averageRoundTripTimeInMs || 0;
  const { percentage: latencyPercentage, status: latencyStatus } = calculateLatencyPercentage(latencyValue);
  const qualityStatus = getQualityStatus(latencyValue);
  
  if (!callStatsReport) {
    return (
      <div className="flex flex-col items-center justify-center h-24 bg-blue-100 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]">
        <Activity className="animate-pulse mb-1" size={18} />
        <p className="text-xs font-medium">Loading call statistics...</p>
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-hidden">
      {/* Summary section (always visible) */}
      <div 
        className="bg-blue-100 border-2 border-black p-2 shadow-[3px_3px_0px_rgba(0,0,0,1)] mb-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Activity className="mr-1.5" size={16} />
            <h3 className="font-bold text-sm">Call Statistics</h3>
          </div>
          <ArrowDown 
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`} 
            size={14}
          />
        </div>
        
        <div className="flex items-center justify-between mt-1.5 border-t-2 border-black pt-1.5">
          {/* Latency gauge */}
          <div className="flex items-center">
            <CircularProgressBar 
              percentage={latencyPercentage} 
              status={latencyStatus}
            />
            <div className="ml-2">
              <p className="text-[10px] font-semibold">Network Latency</p>
              <p className="text-xs font-mono">{latencyValue.toFixed(0)} ms</p>
            </div>
          </div>
          
          {/* Quality Tile (replacing duration) */}
          <div className={`flex items-center justify-center border-2 border-black px-3 py-1 font-bold text-sm ${qualityStatus.color}`}>
            {qualityStatus.text}
          </div>
        </div>
      </div>
      
      {/* Detailed stats (expandable) */}
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 mb-2">
              <StatCard
                title="Datacenter"
                value={callStatsReport.datacenter}
                icon={<Signal size={12} />}
                color="bg-purple-200"
              />
              <StatCard
                title="Connection"
                value={latencyValue < 75 ? "Excellent" : latencyValue < 150 ? "Good" : latencyValue < 300 ? "Fair" : "Poor"}
                icon={<Wifi size={12} />}
                color={getQualityStatus(latencyValue).color}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <StatCard
                title="Upload"
                value={publishBitrate}
                icon={<Upload size={12} />}
                color="bg-green-200"
              />
              <StatCard
                title="Download"
                value={subscribeBitrate}
                icon={<Download size={12} />}
                color="bg-blue-200"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <StatCard
                title="Resolution (Out)"
                value={formatResolution(callStatsReport.publisherStats)}
                icon={<ArrowRight size={12} />}
                color="bg-yellow-200"
              />
              <StatCard
                title="Resolution (In)"
                value={formatResolution(callStatsReport.subscriberStats)}
                icon={<ArrowDown size={12} />}
                color="bg-orange-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <StatCard
                title="Codec"
                value={callStatsReport.publisherStats.codec || "Unknown"}
                icon={<Radio size={12} />}
                color="bg-indigo-200"
              />
              <StatCard
                title="Quality Limit"
                value={callStatsReport.publisherStats.qualityLimitationReasons || "none"}
                icon={<HelpCircle size={12} />}
                color="bg-red-100"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function to format resolution
const formatResolution = (stats: AggregatedStatsReport) => {
  const { highestFrameWidth: w, highestFrameHeight: h, highestFramesPerSecond: fps } = stats;
  
  if (!w || !h) return 'No video';
  
  let result = `${w}×${h}`;
  if (fps) result += `@${fps.toFixed(0)}`;
  
  return result;
};

export default NeoBrutalCallStats;