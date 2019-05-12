import React from 'react';
import swal from 'sweetalert';
import axios from 'axios';

import { authenticationService } from '../Modules/AuthenticationService';
import { messageUser } from '../Modules/Socket';

import '../StyleSheets/auth.css';
import '../StyleSheets/account.css';
import '../StyleSheets/messagePopup.css';

import defaultImage from '../Images/DefaultProfile.png';
import Cover from '../Images/Cover.png';

class UserAccountPage extends React.Component {
	state = {
		userInfo: null,
		user: null,
		isLoading: true,
		isMe: true,
		isFollowing: false,
		messaging: false
	};

	componentDidMount() {
		authenticationService.validateUser();
		authenticationService.profile.subscribe(data => this.setState({ userInfo: data }));

		const regexp = /\/\user\/(.*)/;
		const match = regexp.exec(window.location.pathname);
		const name = match[1];
		this.getUser(name);
	}

	getUser(name) {
		if (!name) return this.props.history.push('/account');
		fetch(`http://api.selftoolz.us:3001/user/${name}`)
			.then(data => data.json())
			.then(res => {
				this.setState({ user: res, isLoading: false });
				const self = JSON.parse(localStorage.getItem('profile'));
				if (self && res.username === self.username) return this.props.history.push('/account');
				else this.setState({ isMe: false, isFollowing: false });
				const followers = res.followers;
				if (self) for (let i in followers) if (followers[i] === self.pID) this.setState({ isFollowing: true });
			});
	}

	followUser(e) {
		e.preventDefault();
		if (!localStorage.getItem('profile') || !localStorage.getItem('sessionID')) {
			swal('Error Occurred', 'You must sign in to follow this user', 'error');
			localStorage.clear();
		} else {
			axios
				.post(
					`http://api.selftoolz.us:3001/follow/${this.state.user.username}`,
					{},
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem('sessionID')}`,
							pID: this.state.user.pID
						}
					}
				)
				.then(data => {
					data = data.data;
					if (data.message) return this.setState({ error: data.message });
					this.getUser(this.state.user.username);
				});
		}
	}

	unfollowUser(e) {
		e.preventDefault();
		if (!localStorage.getItem('profile') || !localStorage.getItem('sessionID')) {
			swal('Error Occurred', 'You must sign in to follow this user', 'error');
			localStorage.clear();
		} else {
			axios
				.post(
					`http://api.selftoolz.us:3001/unfollow/${this.state.user.username}`,
					{},
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem('sessionID')}`,
							pID: this.state.user.pID
						}
					}
				)
				.then(data => {
					data = data.data;
					if (data.message) return this.setState({ error: data.message });
					this.getUser(this.state.user.username);
				});
		}
	}

	messageUser(e) {
		e.preventDefault();
		// this.setState({ messaging: true });
		messageUser(this.state.user.pID, 'Hello new');
	}

	render() {
		const { user, isFollowing, isMe } = this.state;

		return (
			<div className="post-feed accountFeed">
				{this.state.isLoading && (
					<article className="post-card post no-image authArticle userArticle">
						<div className="accountBody">
							<div className="accountRow">
								<div className="accountCol">
									<h5 className="accountName">Loading User Profile...</h5>
								</div>
							</div>
						</div>
					</article>
				)}
				{!this.state.isLoading && !user.message && (
					<article className="post-card post no-image authArticle">
						<img src={Cover} alt="Cover" className="bannerImage" />
						<div className="accountHolder">
							<img src={user.profileImage ? user.profileImage : defaultImage} className="accountImage" alt="Account" />
						</div>
						<div className="accountBody">
							<div className="accountRow">
								<div className="accountCol">
									{!isMe && !isFollowing && (
										<button className="userBtn follow" onClick={this.followUser.bind(this)}>
											Follow
										</button>
									)}
									{!isMe && isFollowing && (
										<button className="userBtn unfollow" onClick={this.unfollowUser.bind(this)}>
											Unfollow
										</button>
									)}
									{!isMe && (
										<button className="userBtn message" onClick={this.messageUser.bind(this)}>
											Message
										</button>
									)}
									<h5 className="accountName">{user.username}</h5>
									<small className={user.role.admin ? 'roleGroup admin' : user.role.mod ? 'roleGroup mod' : ''}>
										{user.role.admin ? 'Admin' : user.role.mod ? 'Moderator' : ''}
									</small>
									<div className="profileCard">
										<div>
											<span className="heading">{Object.keys(user.followers).length}</span>
											<span className="description">Followers</span>
										</div>
										<div>
											<span className="heading">{Object.keys(user.following).length}</span>
											<span className="description">Following</span>
										</div>
										<div>
											<span className="heading">{Object.keys(user.posts).length}</span>
											<span className="description">Posts</span>
										</div>
									</div>
								</div>
							</div>
							{/* <div className="accountInfo">
								<div>Bucharest, Romania</div>
								<div>Solution Manager - Creative Tim Officer</div>
								<div>University of Computer Science</div>
							</div> */}
						</div>
					</article>
				)}
				{!this.state.isLoading && user.message && (
					<article className="post-card post no-image authArticle userArticle">
						<div className="accountBody">
							<div className="accountRow">
								<div className="accountCol">
									<h5 className="accountName">Profile not found!</h5>
								</div>
							</div>
						</div>
					</article>
				)}
				{!this.state.isLoading && user.messaging && (
					<div className="modalOverlay">
						<form className="messageModal" onSubmit="return false;">
							<header className="modalHeader">
								<h3 className="modalTitle">Send Message</h3>
							</header>
							<div className="modalContent">
								<p className="messageValue">
									<label for="username">Recipient</label>
									<br />
									<input id="recipient" className="recipient" type="text" username="username" autoComplete="username" disabled value="xAz" />
								</p>
								<p className="messageValue">
									<label for="message">Message</label>
									<br />
									<textarea id="message" name="message" placeholder="Type a message..." />
								</p>
							</div>
							<footer className="modalFooter">
								<button type="submit" className="cancelMessage">
									Cancel
								</button>
								<button type="submit" className="sendMessage">
									Send
								</button>
							</footer>
						</form>
					</div>
				)}
			</div>
		);
	}
}

export { UserAccountPage };
