import React from 'react';
import axios from 'axios';

import { login } from '../Modules/Socket';

import '../StyleSheets/auth.css';

class LoginPage extends React.Component {
	state = {
		error: null,
		connected: false
	};

	componentDidMount() {
		const sID = localStorage.getItem('sessionID');
		const profile = localStorage.getItem('profile');
		if (sID && profile) return this.setState({ connected: true });
	}

	login(e) {
		e.preventDefault();

		const username = document.getElementsByClassName('username')[0].value;
		const password = document.getElementsByClassName('password')[0].value;

		axios.post(`http://api.selftoolz.us:3001/login`, { username, password }).then(data => {
			data = data.data;
			if (data.message) return this.setState({ error: data.message });
			localStorage.setItem('sessionID', data.sid);
			localStorage.setItem('profile', JSON.stringify(data.profile.value));
			localStorage.setItem('timeLoggedIn', new Date().getTime());
			login();
			window.location.replace('/');
		});
	}

	render() {
		const { error, connected } = this.state;
		return (
			<div>
				{!connected && (
					<div className="post-feed authFeed">
						<article className="post-card post no-image authArticle">
							<form className="authForm" onSubmit={this.login.bind(this)}>
								<span className="authTitle">Login</span>
								{error && <span className="errorMessage">{error}</span>}
								<div className="authDiv" data-validate="Username is required">
									<input className="authInput username" type="text" name="username" placeholder="Username" />
									<span className="authFocus" />
								</div>

								<div className="authDiv" data-validate="Password is required">
									<input className="authInput password" type="password" name="pass" placeholder="Password" />
									<span className="authFocus" />
								</div>

								<div className="authContainer">
									<button className="authButton" type="submit">
										Login
									</button>
								</div>
							</form>
						</article>
					</div>
				)}
				{connected && (
					<div className="post-feed accountFeed">
						<article className="post-card post no-image authArticle userArticle">
							<div className="accountBody">
								<div className="accountRow">
									<div className="accountCol">
										<h5 className="accountName">You are already signed in</h5>
									</div>
								</div>
							</div>
						</article>
					</div>
				)}
			</div>
		);
	}
}

export { LoginPage };
