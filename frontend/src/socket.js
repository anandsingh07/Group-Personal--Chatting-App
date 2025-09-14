import { io } from 'socket.io-client';

let socket = null;

export function connectSocket() {
	if (!socket) {
		socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');
	}
	return socket;
}
