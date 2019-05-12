import io from 'socket.io-client';
import swal from 'sweetalert';

const socket = io('http://api.selftoolz.us:3001');

const configureSocket = () => {
	socket.on('connect', () => {
		console.log('connected');
	});
	return socket;
};

export const login = () => {
	if (localStorage.getItem('profile') && localStorage.getItem('sessionID')) socket.emit('login', JSON.parse(localStorage.getItem('profile')).pID);
};

export const messageUser = (pID, message) => {
	if (!localStorage.getItem('profile') || !localStorage.getItem('sessionID')) return swal('Error Occurred', 'You must sign in to message this user', 'error');

	if (!pID || !message) return swal('Error Occurred', 'An error occurred while sending a message', 'error');
	socket.emit('message', {
		pID,
		message
	});
};

export default configureSocket;
