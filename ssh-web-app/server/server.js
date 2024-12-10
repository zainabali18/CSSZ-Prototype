const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spoonacularApi } = require('../src/api/spoonacular');

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

// Moved the preference-related endpoints here
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

    const selectedPreferenceNames = preferences.map((id) => {
        const preference = preferencesList.find((pref) => pref.id === id);
        return preference ? preference.name : null;
    }).filter(Boolean);

    database.users[userIndex].preferences = selectedPreferenceNames;
    writeDatabase(database);

    res.status(200).send({ message: 'Preferences updated successfully' });
});

// Add this endpoint for adding a single preference
app.post('/preferences/add', (req, res) => {
    const { email, preferenceId } = req.body;

    if (!email || !preferenceId) {
        return res.status(400).send({ error: 'Email and preference are required' });
    }   

    const database = readDatabase();
    const user = database.users.find((user) => user.email === email);

    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }

    const preferenceToAdd = preferencesList.find(p => p.id === preferenceId);
    if (!preferenceToAdd) {
        return res.status(400).send({ error: 'Invalid preference ID' });
    }

    if (!user.preferences.includes(preferenceToAdd.name)) {
        return res.status(400).send({ error: 'Preference already exists for this user' });
    }

    user.preferences.push(preferenceToAdd.name);
    writeDatabase(database);

    res.status(200).send({ message: 'Preference added successfully' });
});

// Add this endpoint for deleting a single preference
app.post('/preferences/delete', (req, res) => {
    const { email, preferenceId } = req.body;

    if (!email || !preferenceId == undefined) {
        return res.status(400).send({ error: 'Email and preference ID are required' });
    }

    const database = readDatabase();
    const user = database.users.find((user) => user.email === email);

    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }

    const preferenceToDelete = preferencesList.find(p => p.id === preferenceId);
    if (!preferenceToDelete) {
        return res.status(400).send({ error: 'Invalid preference ID' });
    }

    user.preferences = user.preferences.filter(p => p !== preferenceToDelete.name);
    writeDatabase(database);

    res.status(200).send({ message: 'Preference deleted successfully', preferences: user.preferences });
});

// Predefined categories
const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Pantry', 'Other'];

// Add item to inventory with user association
app.post('/api/inventory', async (req, res) => {
    const { email, name, quantity, expiryDate, category } = req.body;

    if (!email || !name || !expiryDate) {
        return res.status(400).json({ error: 'Email, name, and expiry date are required' });
    }

    // Editing date formatting
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(expiryDate)) {
        return res.status(400).json({ error: 'Invalid expiry date format. Use dd/mm/yyyy.' });
    }

    const database = readDatabase();
    const user = database.users.find((user) => user.email === email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Parse expiryDate 
    const [day, month, year] = expiryDate.split('/');
    const expiryDateObject = new Date(`${year}-${month}-${day}`);

    const newItem = {
        id: Date.now(),
        name,
        quantity: quantity || 1,
        expiryDate,
        category: category || 'Other',
    };

    user.inventory = user.inventory || [];
    user.inventory.push(newItem);
    writeDatabase(database);

    res.status(201).json({ message: 'Item added to inventory', item: newItem });
});

// Get all inventory items for a user
app.get('/api/inventory', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const database = readDatabase();
    const user = database.users.find((user) => user.email === email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ inventory: user.inventory || [] });
});

// Delete inventory item
app.delete('/api/inventory/:itemId', (req, res) => {
    const { email } = req.body;
    const { itemId } = req.params;

    if (!email || !itemId) {
        return res.status(400).json({ error: 'Email and item ID are required' });
    }

    const database = readDatabase();
    const user = database.users.find((user) => user.email === email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (!user.inventory) {
        return res.status(404).json({ error: 'No inventory items found' });
    }

    const initialLength = user.inventory.length;
    user.inventory = user.inventory.filter(item => item.id !== parseInt(itemId));

    if (user.inventory.length === initialLength) {
        return res.status(404).json({ error: 'Item not found' });
    }

    writeDatabase(database);
    res.status(200).json({ message: 'Item deleted successfully' });
});

// Get expiring items for a user
app.get('/api/inventory/expiring', (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const database = readDatabase();
    const user = database.users.find((user) => user.email === email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringItems = (user.inventory || []).filter(item => {
        const [day, month, year] = item.expiryDate.split('/');
        const expiryDate = new Date(`${year}-${month}-${day}`);
        return expiryDate >= today && expiryDate <= sevenDaysFromNow;
    });

    res.status(200).json({ expiringItems });
});

// Add category to item
app.patch('/api/inventory/:itemId/category', (req, res) => {
    const { email } = req.body;
    const { itemId } = req.params;
    const { category } = req.body;

    if (!email || !CATEGORIES.includes(category)) {
        return res.status(400).json({ error: 'Email and valid category are required' });
    }

    const database = readDatabase();
    const user = database.users.find((user) => user.email === email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const item = (user.inventory || []).find(item => item.id === parseInt(itemId));
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }

    item.category = category;
    writeDatabase(database);
    res.status(200).json({ message: 'Category updated successfully', item });
});

// Update quantity of item in inventory 
app.patch('/api/inventory/:itemId/quantity', (req, res) => {
    const { email, quantity } = req.body; 
    const { itemId } = req.params; 

    if (!email || quantity === undefined || quantity < 0) {
        return res.status(400).json({ error: 'Email and valid quantity are required. Quantity must be a non-negative number.' });
    }

    const database = readDatabase();
    const user = database.users.find((user) => user.email === email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const item = (user.inventory || []).find((item) => item.id === parseInt(itemId));
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }

    // Update the item's quantity
    item.quantity = quantity;
    writeDatabase(database);

    res.status(200).json({ message: 'Quantity updated successfully', item });
});


// Get recipes based on user inventory
app.get('/api/recipes/suggest', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const database = readDatabase();
    const user = database.users.find((user) => user.email === email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const ingredientNames = (user.inventory || []).map(item => item.name).join(',');
    const dietPreferences = user.preferences.filter((pref) =>
        ['Vegetarian', 'Vegan', 'Keto', 'Gluten Free'].includes(pref)
    );
    const intolerances = user.preferences.filter((pref) =>
        ['Dairy Free', 'Nut Free', 'Shellfish Free', 'Egg Free', 'Soy Free', 'Sesame'].includes(pref)
    );

    try {
        const response = await axios.get(`${BASE_URL}/recipes/findByIngredients`, {
            params: {
                apiKey: API_KEY,
                ingredients: ingredientNames,
                number: 10,
                diet: dietPreferences.join(','),
                intolerances: intolerances.join(','),
            }
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});

// Get recipe details
app.get('/api/recipes/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Recipe ID is required' });
    }

    try {
        const recipeDetails = await spoonacularApi.getRecipeById(id);
        res.json(recipeDetails);
    }
    catch (error) {
        console.error('Error fetching recipe details:', error);
        res.status(500).json({ error: 'Failed to fetch recipe details' });
    }
});

// Get recipes based on ingredients nearing expiry
app.get('/api/recipes/expiring', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const database = readDatabase();
    const user = database.users.find((user) => user.email === email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/; // Validation regex for dd/mm/yyyy

    const expiringIngredients = (user.inventory || [])
        .filter((item) => {
            if (!dateRegex.test(item.expiryDate)) {
                console.warn(`Invalid expiry date format for item "${item.name}": ${item.expiryDate}`);
                return false; 
            }

            const [day, month, year] = item.expiryDate.split('/');
            const expiryDate = new Date(`${year}-${month}-${day}`);

            return expiryDate >= today && expiryDate <= sevenDaysFromNow;
        })
        .map((item) => item.name)
        .join(',');

    if (!expiringIngredients) {
        return res.status(200).json({ message: 'No items nearing expiry', recipes: [] });
    }

    try {
        const response = await axios.get(`${BASE_URL}/recipes/findByIngredients`, {
            params: {
                apiKey: API_KEY,
                ingredients: expiringIngredients,
                number: 10,
            }
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
