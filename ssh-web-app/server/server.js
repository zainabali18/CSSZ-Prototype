const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: 'http://localhost:3000' 
}));
app.use(bodyParser.json());

const dbPath = path.join(__dirname, 'data', 'database.json');

const readDatabase = () => {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
};

const writeDatabase = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
};

// Endpoint to check if an email exists
app.get('/check-email', (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).send({ error: 'Email is required' });
    }

    const database = readDatabase();
    const userExists = database.users.some((user) => user.email === email);

    if (userExists) {
        return res.status(200).send({ exists: true, message: 'Email already registered' });
    }

    res.status(200).send({ exists: false, message: 'Email is available' });
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send({ error: 'All fields are required' });
    }

    const database = readDatabase();

    // Check if the email already exists
    const userExists = database.users.some((user) => user.email === email);
    if (userExists) {
        return res.status(400).send({ error: 'User with this email already exists' });
    }

    // Create a new user and add to database
    const newUser = { id: Date.now(), username, email, password, preferences: [] };
    database.users.push(newUser);
    writeDatabase(database);

    res.status(201).send({ message: 'User registered successfully', user: newUser });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ error: 'Email and password are required' });
    }

    const database = readDatabase();
    const user = database.users.find((user) => user.email === email);

    if (!user || user.password !== password) {
        return res.status(401).send({ error: 'Invalid email or password' });
    }

    res.status(200).send({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
});

// Endpoint to get user preferences
app.get('/preferences', (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).send({ error: 'Email is required' });
    }

    const database = readDatabase();
    const user = database.users.find((user) => user.email === email);

    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }

    res.status(200).send({ preferences: user.preferences });
});

// Endpoint to update user preferences
app.post('/preferences', (req, res) => {
    const { email, preferences } = req.body;

    if (!email || !preferences) {
        return res.status(400).send({ error: 'Email and preferences are required' });
    }

    const database = readDatabase();
    const user = database.users.find((user) => user.email === email);

    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }

    user.preferences = preferences;
    writeDatabase(database);

    res.status(200).send({ message: 'Preferences updated successfully' });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
