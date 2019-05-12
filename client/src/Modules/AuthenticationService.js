import { BehaviorSubject } from 'rxjs';
import axios from 'axios';

const sID = localStorage.getItem('sessionID');
const profile = new BehaviorSubject(JSON.parse(localStorage.getItem('profile')));

export const authenticationService = {
	profile: profile.asObservable(),
	sID,
	validateUser,
	get currentUserValue() {
		return profile.value;
	}
};

function validateUser() {
	if (!sID) return;
	axios
		.post(
			`http://api.selftoolz.us:3001/verify`,
			{ sID },
			{
				headers: {
					Authorization: `Bearer ${sID}`
				}
			}
		)
		.then(data => {
			if (!data.data.cas) {
				localStorage.clear();
				window.location.replace('/login');
			} else {
				axios
					.post(
						`http://api.selftoolz.us:3001/account`,
						{ sID },
						{
							headers: {
								Authorization: `Bearer ${sID}`
							}
						}
					)
					.then(data => {
						data = data.data[0];
						localStorage.setItem('profile', JSON.stringify(data));
					});
			}
		});
}
