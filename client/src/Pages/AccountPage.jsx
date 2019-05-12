import React from 'react';

import '../StyleSheets/auth.css';
import '../StyleSheets/account.css';

import { authenticationService } from '../Modules/AuthenticationService';
import defaultImage from '../Images/DefaultProfile.png';
import Cover from '../Images/Cover.png';

class AccountPage extends React.Component {
	state = {
		userInfo: null
	};

	componentDidMount() {
		authenticationService.validateUser();
		authenticationService.profile.subscribe(data => this.setState({ userInfo: data }));
	}

	render() {
		const userInfo = JSON.parse(localStorage.getItem('profile'));
		const { role } = userInfo;
		return (
			<div className="post-feed accountFeed">
				<article className="post-card post no-image authArticle">
					<img src={Cover} alt="Cover" className="bannerImage" />
					<div className="accountHolder">
						<img src={userInfo.profileImage ? userInfo.profileImage : defaultImage} className="accountImage" alt="Account" />
					</div>
					<div className="accountBody">
						<div className="accountRow">
							<div className="accountCol">
								<h5 className="accountName">{userInfo.username}</h5>
								<small className={role.admin ? 'roleGroup admin' : role.mod ? 'roleGroup mod' : ''}>{role.admin ? 'Admin' : role.mod ? 'Moderator' : ''}</small>
								<div className="profileCard">
									<div>
										<span className="heading">{Object.keys(userInfo.followers).length}</span>
										<span className="description">Followers</span>
									</div>
									<div>
										<span className="heading">{Object.keys(userInfo.following).length}</span>
										<span className="description">Following</span>
									</div>
									<div>
										<span className="heading">{Object.keys(userInfo.posts).length}</span>
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
			</div>
		);
	}
}

export { AccountPage };
