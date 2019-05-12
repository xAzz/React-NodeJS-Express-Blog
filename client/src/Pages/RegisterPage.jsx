import React from 'react';
import axios from 'axios';
import '../StyleSheets/auth.css';

class RegisterPage extends React.Component {
	state = {
		currentUser: null,
		connected: false,
		error: null
	};

	componentDidMount() {
		const sID = localStorage.getItem('sessionID');
		const profile = localStorage.getItem('profile');
		if (sID && profile) return this.setState({ connected: true });
	}

	register(e) {
		e.preventDefault();

		const username = document.getElementsByClassName('username')[0].value;
		const password = document.getElementsByClassName('password')[0].value;
		const confirmPassword = document.getElementsByClassName('confirmPassword')[0].value;

		axios.post(`http://api.selftoolz.us:3001/register`, { username, password, confirmPassword }).then(data => {
			data = data.data;
			if (data.message) return this.setState({ error: data.message });
			this.props.history.push('/login');
		});
	}

	render() {
		const { error, connected } = this.state;
		return (
			<div>
				{!connected && (
					<div className="post-feed authFeed">
						<article className="post-card post no-image authArticle">
							<form className="authForm" onSubmit={this.register.bind(this)}>
								<span className="authTitle">Register</span>
								{error && <span className="errorMessage">{error}</span>}
								<div className="authDiv" data-validate="Username is required">
									<input className="authInput username" type="text" name="username" placeholder="Username" />
									<span className="authFocus" />
								</div>

								<div className="authDiv" data-validate="Password is required">
									<input className="authInput password" type="password" name="password" placeholder="Password" />
									<span className="authFocus" />
								</div>

								<div className="authDiv" data-validate="Confirm Password is required">
									<input className="authInput confirmPassword" type="password" name="confirmPassword" placeholder="Confirm Password" />
									<span className="authFocus" />
								</div>

								<div className="authContainer">
									<button className="authButton" type="submit">
										Register
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

export { RegisterPage };
