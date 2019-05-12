import React from 'react';
import axios from 'axios';

import { authenticationService } from '../Modules/AuthenticationService';

class BlogPage extends React.Component {
	state = {
		userInfo: null,
		error: null
	};

	componentDidMount() {
		authenticationService.profile.subscribe(data => this.setState({ userInfo: data }));
	}

	postBlog(e) {
		e.preventDefault();

		const title = document.getElementsByClassName('topic')[0].value;
		const content = document.getElementsByClassName('write')[0].value;
		const sID = localStorage.getItem('sessionID');

		if (!sID || sID === 'undefined') {
			localStorage.removeItem('sessionID');
			localStorage.removeItem('profile');
			window.location.replace('/login');
		}

		axios
			.post(
				`http://api.selftoolz.us:3001/blog`,
				{ title, content },
				{
					headers: {
						Authorization: `Bearer ${sID}`
					}
				}
			)
			.then(data => {
				data = data.data;
				if (data.message) return this.setState({ error: data.message });
				window.location.replace('/');
			});
	}

	cancelBlog(e) {
		e.preventDefault();
		document.getElementsByClassName('topic')[0].value = '';
		document.getElementsByClassName('write')[0].value = '';
	}

	render() {
		return (
			<div className="post-feed">
				<article className="post-card post no-image loadingBlogs">
					<div className="post-card-content">
						<a className="post-card-content-link">
							<header className="post-card-header">
								<input className="topic" type="text" tabIndex="1" placeholder="Enter your topic title here..." required />
								<textarea className="write" tabIndex="4" dir="ltr" required />
							</header>
						</a>
						<footer className="post-card-meta">
							<button className="blogBtn lightRed ripple-effect" onClick={this.cancelBlog.bind(this)}>
								Cancel
							</button>
							<button className="blogBtn lightBlue ripple-effect postBlog" onClick={this.postBlog.bind(this)}>
								Post
							</button>
						</footer>
					</div>
				</article>
			</div>
		);
	}
}

export { BlogPage };
