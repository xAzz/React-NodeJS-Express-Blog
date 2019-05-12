import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export const PrivateRoute = ({ component: Component, ...rest }) => (
	<Route
		{...rest}
		render={props => {
			const user = localStorage.getItem('sessionID');
			if (!user) return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;

			// authorised so return component
			return <Component {...props} />;
		}}
	/>
);
