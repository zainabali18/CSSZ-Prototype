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

let inventory = [];

// Add item to inventory with user association
app.post('/api/inventory', async (req, res) => {
    const { name, quantity, expiryDate, userId } = req.body;
    
    try {
        // First search Spoonacular for the ingredient
        const searchResult = await spoonacularApi.searchRecipes(name);
        
        if (!searchResult.results || searchResult.results.length === 0) {
            return res.status(400).json({ error: 'Invalid ingredient name' });
        }

        const ingredient = searchResult.results[0];
        
        const newItem = {
            id: Date.now(),
            userId,
            name: ingredient.title,
            spoonacularId: ingredient.id,
            quantity: quantity || 1,
            expiryDate,
            dateAdded: new Date(),
            category: 'uncategorized'
        };
        
        inventory.push(newItem);
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error adding inventory item:', error);
        res.status(500).json({ error: 'Failed to add inventory item' });
    }
});

// Get user's inventory
app.get('/api/ingredients/search', async (req, res) => {
    const { query } = req.query;
    try {
        const results = await spoonacularApi.searchRecipes(query);
        res.json(results);
    } catch (error) {
        console.error('Error searching ingredients:', error);
        res.status(500).json({ error: 'Failed to search ingredients' });
    }
});

// Update inventory item
app.put('/api/inventory/:id', async (req, res) => {
    const { id } = req.params;
    const { name, quantity, expiryDate, category } = req.body;
    
    try {
        const itemIndex = inventory.findIndex(item => item.id === parseInt(id));
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // If name is being updated, get new Spoonacular info
        let spoonacularInfo = {};
        if (name && name !== inventory[itemIndex].name) {
            const searchResult = await spoonacularApi.searchRecipes(name);
            if (searchResult.results && searchResult.results.length > 0) {
                spoonacularInfo = await spoonacularApi.getRecipeById(searchResult.results[0].id);
            }
        }

        inventory[itemIndex] = {
            ...inventory[itemIndex],
            name: spoonacularInfo.title || inventory[itemIndex].name,
            spoonacularId: spoonacularInfo.id || inventory[itemIndex].spoonacularId,
            quantity: quantity || inventory[itemIndex].quantity,
            expiryDate: expiryDate || inventory[itemIndex].expiryDate,
            category: category || spoonacularInfo.aisle || inventory[itemIndex].category,
            nutritionInfo: spoonacularInfo.nutrition || inventory[itemIndex].nutritionInfo
        };

        res.json(inventory[itemIndex]);
    } catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Delete inventory item
app.delete('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = inventory.length;
    inventory = inventory.filter(item => item.id !== parseInt(id));

    if (inventory.length === initialLength) {
        return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully' });
});

// Add this endpoint for updating quantity
app.patch('/api/inventory/:id/quantity', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    
    const item = inventory.find(item => item.id === parseInt(id));
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }
    
    item.quantity = quantity;
    res.json(item);
});

// Predefined categories
const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Pantry', 'Other'];

// Add category to item
app.patch('/api/inventory/:id/category', (req, res) => {
    const { id } = req.params;
    const { category } = req.body;
    
    if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
    }
    
    const item = inventory.find(item => item.id === parseInt(id));
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }
    
    item.category = category;
    res.json(item);
});

// Get soon-to-expire items (within 7 days)
app.get('/api/inventory/:userId/expiring', (req, res) => {
    const { userId } = req.params;
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringItems = inventory.filter(item => {
        const expiryDate = new Date(item.expiryDate);
        return item.userId === userId && 
               expiryDate <= sevenDaysFromNow && 
               expiryDate >= new Date();
    });
    
    res.json(expiringItems);
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
