import React from 'react';
import { Redirect } from 'react-router-dom';
import '../StyleSheets/auth.css';

class LogoutPage extends React.Component {
	checkSession() {
		const sID = localStorage.getItem('sessionID');
		const profile = localStorage.getItem('profile');
		if (profile || sID) {
			localStorage.removeItem('sessionID');
			setTimeout(() => {
				localStorage.removeItem('profile');
				window.location.replace('/login');
			}, 500);
		} else {
			return <Redirect to="/" />;
		}
	}

	render() {
		return this.checkSession();
	}
}

export { LogoutPage };
