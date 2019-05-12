import React from 'react';
import { Link } from 'react-router-dom';

import { authenticationService } from '../Modules/AuthenticationService';
import '../StyleSheets/user.css';

class UsersPage extends React.Component {
	state = {
		userInfo: null,
		users: null,
		error: null
	};

	componentDidMount() {
		authenticationService.profile.subscribe(data => this.setState({ userInfo: data }));
		fetch(`http://api.selftoolz.us:3001/users`)
			.then(data => data.json())
			.then(res => this.setState({ users: res }));
	}

	render() {
		const { users } = this.state;
		return (
			users && (
				<div className="post-feed">
					<article className="post-card post no-image">
						<div className="post-card-content userCard">
							{users && <h2 className="userTitle">Users</h2>}
							{users.length <= 0 ? (
								<a className="post-card-content-link">
									<header className="post-card-header">
										<h3 className="post-card-title loadingText">No Users Found</h3>
									</header>
								</a>
							) : (
								users.map(user => (
									<div className="user">
										<Link className="userHolder" to={'/user/' + user.username}>
											<img src={user.profileImage} className="userImage" alt="User" />
										</Link>
										<Link className="userName" to={'/user/' + user.username}>
											{user.username}
										</Link>
									</div>
								))
							)}
						</div>
					</article>
				</div>
			)
		);
	}
}

export { UsersPage };
