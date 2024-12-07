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

    const userExists = database.users.some((user) => user.email === email);
    if (userExists) {
        return res.status(400).send({ error: 'User with this email already exists' });
    }

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

app.get('/preferences', (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).send({ error: 'Email is required' });
    }

    try {
        const database = readDatabase();
        const user = database.users.find((user) => user.email === email);

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const preferencesList = [
            { id: 1, name: 'Vegetarian' },
            { id: 2, name: 'Vegan' },
            { id: 3, name: 'Keto' },
            { id: 4, name: 'Gluten Free' },
            { id: 5, name: 'Dairy Free' },
            { id: 6, name: 'Nut Free' },
            { id: 7, name: 'Shellfish Free' },
            { id: 8, name: 'Egg Free' },
            { id: 9, name: 'Soy Free' },
        ];

        const preferenceIds = user.preferences
            .map((name) => {
                const preference = preferencesList.find((pref) => pref.name === name);
                return preference ? preference.id : null;
            })
            .filter(Boolean);

        res.status(200).send({ preferences: preferenceIds });
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).send({ error: 'An error occurred while fetching preferences' });
    }
});


app.post('/preferences', (req, res) => {
    const { email, preferences } = req.body;

    if (!email || !preferences) {
        return res.status(400).send({ error: 'Email and preferences are required' });
    }

    const database = readDatabase();

    const userIndex = database.users.findIndex((user) => user.email === email);

    if (userIndex === -1) {
        return res.status(404).send({ error: 'User not found' });
    }

    const preferencesList = [
        { id: 1, name: 'Vegetarian' },
        { id: 2, name: 'Vegan' },
        { id: 3, name: 'Keto' },
        { id: 4, name: 'Gluten Free' },
        { id: 5, name: 'Dairy Free' },
        { id: 6, name: 'Nut Free' },
        { id: 7, name: 'Shellfish Free' },
        { id: 8, name: 'Egg Free' },
        { id: 9, name: 'Soy Free' },
    ];

    const selectedPreferenceNames = preferences.map((id) => {
        const preference = preferencesList.find((pref) => pref.id === id);
        return preference ? preference.name : null;
    }).filter(Boolean);

    database.users[userIndex].preferences = selectedPreferenceNames;
    writeDatabase(database);

    res.status(200).send({ message: 'Preferences updated successfully' });
});

let ingredients = [];

app.post('/api/ingredients', (req, res) => {
    const { name, expiryDate } = req.body;

    if (!name || !expiryDate) {
        return res.status(400).send({ error: 'Name and ingredient are required' });
    }

    const newIngredient = {
        id: Date.now(),
        name,
        expiryDate,
        dateAddd: new Date()
    };

    ingredients.push(newIngredient);
    res.status(201).send({ message: 'Ingredient added successfully', ingredient: newIngredient });
});

app.get('/api/ingredients', (req, res) => {
    res.status(200).send({ ingredients });
});

app.delete('/api/ingredients/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = ingredients.length;
    ingredients = ingredients.filter((ingredient) => ingredient.id !== parseInt(id));

    if (ingredients.length == initialLength) {
        return res.status(404).send({ error: 'Ingredient not found' });
    }

    res.status(200).send({ message: 'Ingredient deleted successfully' });
});

app.get('/api/recipes', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).send({ error: 'Email is required' });
    }

    try {
        const database = readDatabase();
        const user = database.users.find((user) => user.email === email);

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const ingredientList = ingredients.map(i => i.name).join(',');

        // TODO: Implement recipe search logic using Spoonacular API
        // For now, we'll just return a sample recipe

        res.status(200).send({
            message: 'Recipes fetched successfully',
            ingredients: ingredientList,
            userPreferences: user.preferences
        });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).send({ error: 'An error occurred while fetching recipes' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
