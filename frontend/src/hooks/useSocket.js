import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(url, userId = null) {
  const socketRef = useRef(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const s = io(url, { withCredentials: true });
    socketRef.current = s;
    s.on('announcement', (payload) => setAnnouncements((a) => [payload, ...a].slice(0, 20)));
    
    // Join user room if userId is provided
    if (userId) {
      s.emit('join-user-room', userId);
    }
    
    return () => { s.close(); };
  }, [url, userId]);

  const announce = (message) => socketRef.current?.emit('announce', message);
  return { socket: socketRef.current, announcements, announce };
}