import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useTransactionStore from '../store/transactionStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null;

const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { handleSocketAdd, handleSocketUpdate, handleSocketDelete } = useTransactionStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Create single socket instance
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
    }

    socketRef.current = socketInstance;
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔌 Socket connected');
      socket.emit('join', user._id);
    });

    socket.on('transaction_added', handleSocketAdd);
    socket.on('transaction_updated', handleSocketUpdate);
    socket.on('transaction_deleted', handleSocketDelete);

    socket.on('disconnect', () => console.log('🔌 Socket disconnected'));

    return () => {
      socket.off('transaction_added', handleSocketAdd);
      socket.off('transaction_updated', handleSocketUpdate);
      socket.off('transaction_deleted', handleSocketDelete);
    };
  }, [isAuthenticated, user]);

  return socketRef.current;
};

export default useSocket;
