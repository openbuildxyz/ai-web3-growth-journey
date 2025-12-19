import { useState, useEffect } from 'react';

interface SessionStatusProps {
  className?: string;
}

export default function SessionStatus({ className = '' }: SessionStatusProps) {
  const [sessionStatus, setSessionStatus] = useState<'active' | 'refreshing' | 'expired'>('active');
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);

  useEffect(() => {
    // Listen for session events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          setSessionStatus('active');
        } else {
          setSessionStatus('expired');
        }
      }
    };

    // Listen for refresh events
    const handleTokenRefresh = () => {
      setSessionStatus('refreshing');
      setTimeout(() => setSessionStatus('active'), 1000);
    };

    // Mock heartbeat tracking (in real implementation, this would come from sessionManager)
    const heartbeatInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        setLastHeartbeat(new Date());
        setSessionStatus('active');
      } else {
        setSessionStatus('expired');
      }
    }, 60000); // Check every minute

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tokenRefreshed', handleTokenRefresh);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
      clearInterval(heartbeatInterval);
    };
  }, []);

  const getStatusColor = () => {
    switch (sessionStatus) {
      case 'active': return 'text-green-500';
      case 'refreshing': return 'text-yellow-500';
      case 'expired': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (sessionStatus) {
      case 'active': return 'Session Active';
      case 'refreshing': return 'Refreshing...';
      case 'expired': return 'Session Expired';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        sessionStatus === 'active' ? 'bg-green-500' : 
        sessionStatus === 'refreshing' ? 'bg-yellow-500 animate-pulse' : 
        'bg-red-500'
      }`}></div>
      <span className={`text-xs ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {lastHeartbeat && (
        <span className="text-xs text-gray-400">
          Last: {lastHeartbeat.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
