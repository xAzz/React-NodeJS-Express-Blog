import React from 'react';
import defaultImage from '../Images/DefaultProfile.png';

class HomePage extends React.Component {
	state = {
		data: [],
		interval: false
	};

	componentDidMount() {
		this.getDataFromDb();
		if (!this.state.interval) {
			let interval = setInterval(this.getDataFromDb, 1000);
			this.setState({ interval: interval });
		}
	}

	// never let a process live forever
	// always kill a process everytime we are done using it
	componentWillUnmount() {
		if (this.state.interval) {
			clearInterval(this.state.interval);
			this.setState({ interval: null });
		}
	}

	getDataFromDb = () => {
		fetch('http://51.38.33.72:3001/blogs')
			.then(data => data.json())
			.then(res => this.setState({ data: res }));
	};

	render() {
		const { data } = this.state;
		return (
			<div className="post-feed">
				{data.length <= 0 ? (
					<article className="post-card post no-image loadingBlogs">
						<div className="post-card-content">
							<a className="post-card-content-link">
								<header className="post-card-header">
									<h3 className="post-card-title loadingText">Loading Posts...</h3>
								</header>
							</a>
							<footer className="post-card-meta" />
						</div>
					</article>
				) : (
					data.map(post => (
						<article className="post-card post no-image">
							<div className="post-card-content">
								<a className="post-card-content-link" /*href={'/blog/' + post.postID}*/>
									<header className="post-card-header">
										<h2 className="post-card-title">{post.title}</h2>
									</header>
									<section className="post-card-excerpt">
										<p>{post.content}</p>
									</section>
								</a>
								<footer className="post-card-meta">
									<ul className="author-list">
										<li className="author-list-item">
											<div className="author-name-tooltip">{post.username}</div>
											<a className="static-avatar">
												<img className="author-profile-image" src={post.profileImage ? post.profileImage : defaultImage} alt={post.username} />
											</a>
										</li>
									</ul>
									<span className="reading-time">READ MORE</span>
								</footer>
							</div>
						</article>
					))
				)}
			</div>
		);
	}
}

export { HomePage };
