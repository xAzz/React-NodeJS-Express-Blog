import React from 'react';
import axios from 'axios';

import { authenticationService } from '../Modules/AuthenticationService';
// import { messageUser } from '../Modules/Socket';

import '../StyleSheets/messages.css';

class MessagesPage extends React.Component {
	state = {
		userInfo: null,
		all: null,
		to: null,
		from: null
	};

	componentDidMount() {
		authenticationService.validateUser();
		authenticationService.profile.subscribe(data => this.setState({ userInfo: data }));
		this.getMessages();
	}

	getMessages() {
		if (!localStorage.getItem('sessionID') || !localStorage.getItem('profile')) return this.props.history.push('/account');
		axios
			.post(
				`http://api.selftoolz.us:3001/messages`,
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('sessionID')}`
					}
				}
			)
			.then(({ data }) => {
				this.setState({ to: data.to, from: data.from, all: data });
				console.log(data);
			});
	}

	/*recievedMessage() {
		const str = (
			<li className="recieved">
				<img src="https://cdn.discordapp.com/avatars/479393293017415690/175449d623b1836f5531c543a174fae7.webp?size=512" alt="" />
				<p>Hey xAz! Mistik is a paki who sucks my balls on the daily, could you slap his massive forehead for me? He keeps sending dick pics to lefela</p>
			</li>
		);
	}

	sentMessage() {
		const str = (
			<li className="sent">
				<img src="https://cdn.discordapp.com/avatars/125116914484641792/f1caeaa4f5621d1dd294a6665213917d.webp?size=512" alt="" />
				<p>Dumbass.</p>
			</li>
		);
	}

	userConversationItem() {
		const str = (
			<li className="convoItem" role="row" tabindex="-1">
				<div className="infoHolder">
					<a className="User" role="link" tabindex="-1">
						<div className="usersHolder">
							<div className="imageHolder">
								<div>
									<div className="holdImage">
										<div className="contentHeld">
											<div className="imageDiv">
												<img
													src="https://scontent.fsyd4-1.fna.fbcdn.net/v/t1.0-1/p50x50/57438140_319121692345089_1923177791260459008_n.jpg?_nc_cat=108&amp;_nc_ht=scontent.fsyd4-1.fna&amp;oh=492d21a48441a3fa1db8a10854f2c7cc&amp;oe=5D73AB1D"
													width="50"
													height="50"
													alt=""
													className="img"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="mainInfo">
								<div className="mainHolder">
									<span className="profileName">xAz</span>
									<div>
										<abbr className="timestamp" title="19 February" data-utime="1550511610.644">
											19 Feb
										</abbr>
									</div>
								</div>
								<div className="mainHolder" />
							</div>
						</div>
					</a>
				</div>
			</li>
		);
	}*/

	render() {
		return (
			<div className="post-feed">
				<article className="post-card post no-image loadingBlogs">
					<div className="post-card-content">
						<a className="post-card-content-link">
							<div className="messagesHolder">
								<div className="contentHolder">
									<div className="hold">
										<div className="contentArea">
											<div>
												<div className="conversations">
													<div>
														<span className="spanTitle">
															<label className="messageLabel">
																<h3>Conversations</h3>
															</label>
														</span>
													</div>
													<div>
														<h2 className="convoTitle">Conversation list</h2>
														<ul className="convoList" aria-label="Conversation list" role="grid" />
													</div>
												</div>
												<div className="messages">
													<div>
														<span className="spanTitle">
															<label className="messageLabel">
																<h3>Messages</h3>
															</label>
														</span>
													</div>
													<div>
														<div className="messageBoard">
															<div>
																<div className="board">
																	<ul className="messageHolder" />
																</div>
															</div>
															<div className="inputHolder">
																<div className="inputContent">
																	<div className="held">
																		<div className="context">
																			<input type="text" placeholder="Type a message..." className="chatMsg" />
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</a>
						<footer className="post-card-meta" />
					</div>
				</article>
			</div>
		);
	}
}

export { MessagesPage };
