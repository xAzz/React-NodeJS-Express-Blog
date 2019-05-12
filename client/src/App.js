import React, { Component } from 'react';
import { Switch, BrowserRouter as Router, Route, Link } from 'react-router-dom';

import { HomePage } from './Pages/HomePage';
import { BlogPage } from './Pages/BlogPage';
import { LoginPage } from './Pages/LoginPage';
import { LogoutPage } from './Pages/LogoutPage';
import { RegisterPage } from './Pages/RegisterPage';
import { AccountPage } from './Pages/AccountPage';
import { UsersPage } from './Pages/UsersPage';
import { UserAccountPage } from './Pages/UserAccountPage';
import { MessagesPage } from './Pages/MessagesPage';
import { ErrorPage } from './Pages/ErrorPage';

import { PrivateRoute } from './Modules/PrivateRoute';
import { authenticationService } from './Modules/AuthenticationService';
import { login } from './Modules/Socket';
import { config } from './config';

import './StyleSheets/index.css';
import defaultImage from './Images/DefaultProfile.png';

class App extends Component {
	constructor() {
		super();

		this.state = {
			userInfo: null
		};
	}

	componentDidMount() {
		authenticationService.validateUser();
		authenticationService.profile.subscribe(data => this.setState({ userInfo: data }));
		login();
	}

	render() {
		const { userInfo } = this.state;
		return (
			<Router>
				<div className="site-wrapper">
					<header className="site-header outer responsive-header-img">
						<div className="inner">
							<div className="site-header-content">
								<h1 className="site-title">{config.title}</h1>
								<h2 className="site-description">{config.description}</h2>
							</div>
							<nav className="site-nav">
								<div className="site-nav-left">
									<ul className="nav" role="menu">
										<li className="nav-home" role="menuitem">
											<Link to="/">Home</Link>
										</li>
										<li className="nav-users" role="menuitem">
											<Link to="/users">Users</Link>
										</li>
										{userInfo && (
											<li className="nav-play" role="menuitem">
												<Link to="/new">New Post</Link>
											</li>
										)}
										{userInfo && (
											<li className="nav-play" role="menuitem">
												<Link to="/logout">Logout</Link>
											</li>
										)}
									</ul>
								</div>
								<div className="site-nav-right">
									<ul className="nav" role="menu">
										{userInfo ? (
											<li className="nav-account" role="menuitem">
												<Link to="/account">{userInfo.username}</Link>
											</li>
										) : (
											<li className="nav-logn" role="menuitem">
												<Link to="/login">Login</Link>
											</li>
										)}
										{userInfo ? (
											<img src={userInfo.profileImage ? userInfo.profileImage : defaultImage} className="profileImage" alt="Profile" />
										) : (
											<li className="nav-register" role="menuitem">
												<Link to="/register">Register</Link>
											</li>
										)}
									</ul>
								</div>
							</nav>
						</div>
					</header>
					<main id="site-main" className="site-main outer">
						<div className="inner">
							<Switch>
								<PrivateRoute exact path="/account" component={AccountPage} />
								<PrivateRoute exact path="/messages" component={MessagesPage} />
								<PrivateRoute exact path="/new" component={BlogPage} />
								<Route exact path="/" component={HomePage} />
								<Route path="/login" component={LoginPage} />
								<Route path="/logout" component={LogoutPage} />
								<Route path="/register" component={RegisterPage} />
								<Route path="/users" component={UsersPage} />
								<Route path="/user" component={UserAccountPage} />
								<Route component={ErrorPage} />
							</Switch>
						</div>
					</main>
					<footer className="site-footer outer">
						<div className="site-footer-content inner">
							<section className="copyright">
								<Link to="/">{config.title}</Link> &copy; 2019
							</section>
							<nav className="site-footer-nav">
								<Link to="/">Home</Link>
							</nav>
						</div>
					</footer>
				</div>
			</Router>
		);
	}
}

export default App;
