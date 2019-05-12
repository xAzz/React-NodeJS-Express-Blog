import React from 'react';

class ErrorPage extends React.Component {
	render() {
		return (
			<section class="error-message">
				<h1 class="error-code">404</h1>
				<p class="error-description">Page not found</p>
			</section>
		);
	}
}

export { ErrorPage };
