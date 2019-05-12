const Couchbase = require('couchbase'),
	express = require('express'),
	cors = require('cors'),
	cookieParser = require('cookie-parser'),
	UUID = require('uuid'),
	BodyParser = require('body-parser'),
	BCrypt = require('bcryptjs'),
	Identicon = require('identicon.js'),
	fs = require('fs'),
	app = express(),
	http = require('http').Server(app),
	socketIO = require('socket.io'),
	io = socketIO(http),
	N1qlQuery = Couchbase.N1qlQuery;

const avatarFolder = '../client/public/avatars'; // Root to Avatars Folder where user images will be saved

const cluster = new Couchbase.Cluster('couchbase://127.0.0.1');
cluster.authenticate('', ''); // ('Username', 'Password')
const bucket = cluster.openBucket('selftoolz', ''); // Replace 'selftoolz' with your database name

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.enable('trust proxy');

const validate = (req, res, next) => {
	let authHeader = req.headers['authorization'];
	if (authHeader) {
		bearerToken = authHeader.split(' ');

		if (bearerToken.length === 2) {
			bucket.get(bearerToken[1], (error, result) => {
				if (error) return res.send(error);
				req.pID = result.value.pID;
				bucket.touch(bearerToken[1], 10800, (error, result) => {});
				next();
			});
		} else {
			res.send({ message: 'Bearer token is malformed' });
		}
	} else {
		res.send({ message: 'An authorization header is required' });
	}
};

app.post('/register', (req, res) => {
	if (!req.body.username) return res.send({ message: 'Username is required' });
	else if (!req.body.password) return res.send({ message: 'Password is required' });
	else if (!req.body.confirmPassword) return res.send({ message: 'Confirm your password' });

	if (req.body.password !== req.body.confirmPassword) return res.send({ message: "Passwords don't match" });

	bucket.get(req.body.username.toLowerCase(), (error, result) => {
		if (!error && result) return res.send({ message: 'Username has been taken!' });

		const data = `data:image/png;base64,${new Identicon(UUID.v4(), 420).toString()}`;
		let base64Data, binaryData;
		base64Data = data.replace(/^data:image\/png;base64,/, '');
		base64Data += base64Data.replace('+', ' ');
		binaryData = new Buffer(base64Data, 'base64').toString('binary');

		fs.writeFile(`${avatarFolder}/${req.body.username}.png`, binaryData, 'binary', function(err) {
			if (err) console.log(err);
		});

		const id = UUID.v4();
		const account = {
			type: 'account',
			pID: id,
			username: req.body.username,
			password: BCrypt.hashSync(req.body.password, 10),
			email: null,
			profileImage: `/avatars/${req.body.username}.png`,
			createdAt: new Date().getTime(),
			ipAddress: req.ip,
			banned: false,
			role: {
				admin: false,
				mod: false,
				guest: true
			},
			followers: {},
			following: {},
			posts: {},
			messages: { to: {}, from: {} }
		};

		let profile = req.body;
		profile.type = 'profile';
		profile.profileImage = account.profileImage;
		profile.createdAt = account.createdAt;
		profile.role = account.role;

		delete profile.password;
		delete profile.confirmPassword;
		delete profile.email;
		delete profile.ipAddress;

		bucket.insert(id, profile, (error, result) => {
			if (error) return res.send(error);
			bucket.insert(account.username.toLowerCase(), account, (error, result) => {
				if (error) return bucket.remove(id), res.send(error);
				res.send(result);
			});
		});
	});
});

app.post('/login', (req, res) => {
	if (!req.body.username) return res.send({ message: 'Username is required' });
	else if (!req.body.password) return res.send({ message: 'Password is required' });
	bucket.get(req.body.username.toLowerCase(), (error, result) => {
		if (error) return res.send({ message: 'Username not found' });
		if (!BCrypt.compareSync(req.body.password, result.value.password)) return res.send({ message: 'Invalid Password' });
		let id = UUID.v4();
		let session = {
			type: 'session',
			pID: result.value.pID
		};
		delete result.value.password;
		let profile = result;
		bucket.insert(
			id,
			session,
			{
				expiry: 10800
			},
			(error, result) => {
				res.send({ sid: id, profile });
			}
		);
	});
});

app.get('/blogs', (req, res) => {
	const query = N1qlQuery.fromString(`SELECT ${bucket._name}.* FROM ${bucket._name} WHERE type = 'blog'`);
	bucket.query(query, { id: req.pID }, (error, result) => {
		if (error) return res.send(error);
		res.send(result);
	});
});

app.post('/blog', validate, (req, res) => {
	if (!req.body.title) return res.send({ message: 'Title is required' });
	else if (!req.body.content) return res.send({ message: 'Content is required' });

	let query = N1qlQuery.fromString(`SELECT ${bucket._name}.* FROM ${bucket._name} WHERE type = 'account' AND pID = $id`);
	bucket.query(query, { id: req.pID }, (error, result) => {
		if (error) return res.send(error);

		const postID = new Date().valueOf();
		const username = result[0].username;

		let blog = {
			type: 'blog',
			pID: req.pID,
			username,
			profileImage: result[0].profileImage,
			title: req.body.title,
			content: req.body.content,
			postID: postID,
			timestamp: new Date().getTime()
		};

		let posts = result[0].posts;
		const length = Object.keys(posts).length + 1;
		posts[length.toString()] = blog;

		bucket.insert(UUID.v4(), blog, (error, result) => {
			if (error) return res.send(error);
			query = N1qlQuery.fromString(`UPDATE ${bucket._name} SET posts = ${JSON.stringify(posts)} WHERE type = 'account' AND username = $username`);
			bucket.query(query, { username }, (error, result) => {
				if (error) return res.send(error);
				res.send(blog);
			});
		});
	});
});

app.post('/account', validate, (req, res) => {
	const query = N1qlQuery.fromString(`SELECT ${bucket._name}.* FROM ${bucket._name} WHERE type = 'account' AND pID = $id`);
	bucket.query(query, { id: req.pID }, (error, result) => {
		if (error) return res.send(error);
		res.send(result);
	});
});

app.post('/verify', validate, (req, res) => {
	if (!req.body.sID) return res.send({ message: 'Session ID is required' });

	bucket.get(req.body.sID, (error, result) => {
		if (error || !result) return res.send({ message: 'Session ID not found' });
		res.send(result);
	});
});

app.get('/users', (req, res) => {
	const query = N1qlQuery.fromString(`SELECT ${bucket._name}.* FROM ${bucket._name} WHERE type = 'account'`);
	bucket.query(query, { id: req.pID }, (error, result) => {
		if (error) return res.send(error);
		result.forEach(user => {
			delete user.email;
			delete user.password;
			delete user.ipAddress;
			delete user.createdAt;
			delete user.type;
		});
		res.send(result);
	});
});

app.get('/user/:username', (req, res) => {
	bucket.get(req.params.username.toLowerCase(), (error, result) => {
		if (error) return res.send(error);
		result = result.value;
		delete result.email;
		delete result.password;
		delete result.ipAddress;
		delete result.createdAt;
		delete result.type;
		res.send(result);
	});
});

app.post('/follow/:user', validate, (req, res) => {
	if (!req.params.user) return res.send({ message: 'User name is required' });
	if (req.header('pID') === req.pID) return res.send({ message: '¯\\_(ツ)_//¯' });

	bucket.get(req.params.user.toLowerCase(), (error, result) => {
		if (error) return res.send(error);

		let followers = result.value.followers;
		for (let i in followers) if (followers[i] === req.pID) return res.send({ message: 'You are already following this user' });

		const length = Object.keys(followers).length + 1;
		followers[length.toString()] = req.pID;

		const query = N1qlQuery.fromString(`UPDATE ${bucket._name} SET followers = ${JSON.stringify(followers)} WHERE type = 'account' AND username = $username`);
		bucket.query(query, { username: req.params.user }, (error, result) => {
			if (error) return res.send(error);
			res.send(result);
		});
	});
});

app.post('/unfollow/:user', validate, (req, res) => {
	if (!req.params.user) return res.send({ message: 'User name is required' });
	if (req.header('pID') === req.pID) return res.send({ message: '¯\\_(ツ)_//¯' });

	bucket.get(req.params.user.toLowerCase(), (error, result) => {
		if (error) return res.send(error);

		let followers = result.value.followers;
		for (let i in followers) if (followers[i] === req.pID) delete followers[i];

		const query = N1qlQuery.fromString(`UPDATE ${bucket._name} SET followers = ${JSON.stringify(followers)} WHERE type = 'account' AND username = $username`);
		bucket.query(query, { username: req.params.user }, (error, result) => {
			if (error) return res.send(error);
			res.send(result);
		});
	});
});

app.post('/messages', validate, (req, res) => {
	const query = N1qlQuery.fromString(`SELECT ${bucket._name}.* FROM ${bucket._name} WHERE type = 'account' AND pID = $id`);
	bucket.query(query, { id: req.pID }, (error, result) => {
		if (error) return res.send(error);
		res.send(result[0].messages);
	});
});

io.on('connection', socket => {
	console.log('User Connected');

	socket.verified = false;
	socket.pID = null;
	socket.name = null;

	socket.on('login', data => {
		if (socket.verified || !data) return;

		bucket.get(data, (error, result) => {
			if (error) return res.send(error);

			socket.pID = data;
			socket.name = result.value.name;
			socket.verified = true;
		});
	});

	socket.on('message', data => {
		if (!socket.verified || !data || !data.pID || !data.message) return;

		const { pID, message } = data;

		
	});

	socket.on('disconnect', () => {
		console.log('User Disconnected');
	});
});

const server = http.listen(3001, () => {
	console.log(`Listening on port *:${server.address().port}`);
});
