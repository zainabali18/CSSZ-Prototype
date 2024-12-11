const request = require('supertest');
const fs = require('fs');
const path = require('path');

const app = require('../../server/server.js');


const resetDatabase = () => {
    const initialData = {
        users: [
            {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                preferences: ['Vegetarian'],
                inventory: [
                    { id: 1, name: 'Tomato', quantity: 2, expiryDate: '31/12/2024', category: 'Vegetables' },
                    { id: 2, name: 'Milk', quantity: 1, expiryDate: '15/12/2024', category: 'Dairy' },
                    { id: 3, name:'Spinach', quantity: 5, expiryDate: '10/12/2024', category: 'Vegetables'},
                    { id: 4, name: 'Tofu', quantity: 4, expiryDate: '10/12/2024', category: 'Pantry'},
                    { id: 5, name: 'Apples', quantity: 17, expiryDate: '15/12/2024', category: 'Fruits'}
                ],
                suggestedRecipes: []
            }
        ]
    };

    const dbPath = path.join(__dirname, '..', '..', 'server', 'data', 'database.json');

    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
};

describe('API Tests', () => {
    let server;

    beforeAll(() => {
        server = app.listen(5001, () => {
            console.log(`Test server running on port 5001`);
        });
    });
    
    afterAll(() => {
        server.close(() => {
        });
    });
    

    beforeEach(() => {
        resetDatabase();
    });

    describe('User API', () => {
        describe('POST /register', () => {
            it('Should register a new user', async () => {
                const response = await request(app)
                    .post('/register')
                    .send({ username: 'newuser', email: 'newuser@example.com', password: 'password123' });
                expect(response.statusCode).toBe(201);
                expect(response.body).toHaveProperty('message', 'User registered successfully');
            });
        });

        describe('POST /login', () => {
            it('should login a user with correct credentials', async () => {
                const response = await request(app)
                    .post('/login')
                    .send({ email: 'test@example.com', password: 'password123' });
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('message', 'Login successful');
            });
        });
    });

    describe('Preferences API', () => {
        describe('POST /preferences', () => {
            it('should update preferences successfully', async () => {
                const response = await request(app)
                    .post('/preferences')
                    .send({ email: 'test@example.com', preferences: [1, 2] });
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('message', 'Preferences updated successfully');
            });
        });
    });

    describe('Inventory API', () => {
        describe('POST /api/inventory', () => {
            it('should add an item to inventory', async () => {
                const response = await request(app)
                    .post('/api/inventory')
                    .send({ email: 'test@example.com', name: 'Apple', quantity: 5, expiryDate: '01/01/2025', category: 'Fruits' });
                expect(response.statusCode).toBe(201);
                expect(response.body).toHaveProperty('message', 'Item added to inventory');
            });
        });

        describe('PATCH /api/inventory/:itemId/quantity', () => {
            it('should update an item quantity', async () => {
                const response = await request(app)
                    .patch('/api/inventory/1/quantity')
                    .send({ email: 'test@example.com', quantity: 10 });
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('message', 'Quantity updated successfully');
            });
        });

        describe('DELETE /api/inventory/:itemId', () => {
            it('should delete an item from inventory', async () => {
                const response = await request(app)
                    .delete('/api/inventory/1')
                    .send({ email: 'test@example.com' });
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('message', 'Item deleted successfully');
            });
        });
    });

    describe('Recipe API', () => {
        describe('GET /api/recipes/suggest', () => {
            it('should suggest recipes based on inventory and preferences', async () => {
                const response = await request(app)
                    .get('/api/recipes/suggest')
                    .query({ email: 'test@example.com' });
                expect(response.statusCode).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
            });
        });
    });
    
    describe('Alerts API', () => {
        describe('GET /api/inventory/alerts', () => {
            it('should fetch inventory alerts', async () => {
                const response = await request(app)
                    .get('/api/inventory/alerts')
                    .query({ email: 'test@example.com' });
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('expired');
                expect(response.body).toHaveProperty('expiring');
            });
        });
    });
});
