const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('./server'); 


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
                    { id: 2, name: 'Milk', quantity: 1, expiryDate: '15/12/2024', category: 'Dairy' }
                ]
            }
        ]
    };

    const dbPath = path.join(__dirname, '..', 'server', 'data', 'database.json');
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
};

describe('API Tests', () => {
    beforeEach(() => {
        resetDatabase();
    });


    describe('User Authentication and Registration API', () => {
        describe('GET /check-email', () => {
            it('should return exists: true for an existing email', async () => {
                const response = await request(app)
                    .get('/check-email')
                    .query({ email: 'test@example.com' });
                
                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual({
                    exists: true,
                    message: 'Email already registered'
                });
            });

            it('should return exists: false for a new email', async () => {
                const response = await request(app)
                    .get('/check-email')
                    .query({ email: 'new@example.com' });
                
                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual({
                    exists: false,
                    message: 'Email is available'
                });
            });

            it('should return 400 if no email is provided', async () => {
                const response = await request(app)
                    .get('/check-email');
                
                expect(response.statusCode).toBe(400);
                expect(response.body).toEqual({
                    error: 'Email is required'
                });
            });
        });

        describe('POST /register', () => {
            it('should successfully register a new user', async () => {
                const response = await request(app)
                    .post('/register')
                    .send({
                        username: 'newuser',
                        email: 'newuser@example.com',
                        password: 'password123'
                    });
                
                expect(response.statusCode).toBe(201);
                expect(response.body).toMatchObject({
                    message: 'User registered successfully',
                    user: {
                        username: 'newuser',
                        email: 'newuser@example.com'
                    }
                });
            });

            it('should not register a user with an existing email', async () => {
                const response = await request(app)
                    .post('/register')
                    .send({
                        username: 'duplicateuser',
                        email: 'test@example.com',
                        password: 'password123'
                    });
                
                expect(response.statusCode).toBe(400);
                expect(response.body).toEqual({
                    error: 'User with this email already exists'
                });
            });

            it('should return 400 if registration fields are missing', async () => {
                const response = await request(app)
                    .post('/register')
                    .send({
                        username: 'incompleteuser'
                    });
                
                expect(response.statusCode).toBe(400);
                expect(response.body).toEqual({
                    error: 'All fields are required'
                });
            });
        });

        describe('POST /login', () => {
            it('should successfully login with correct credentials', async () => {
                const response = await request(app)
                    .post('/login')
                    .send({
                        email: 'test@example.com',
                        password: 'password123'
                    });
                
                expect(response.statusCode).toBe(200);
                expect(response.body).toMatchObject({
                    message: 'Login successful',
                    user: {
                        email: 'test@example.com'
                    }
                });
            });

            it('should fail login with incorrect password', async () => {
                const response = await request(app)
                    .post('/login')
                    .send({
                        email: 'test@example.com',
                        password: 'wrongpassword'
                    });
                
                expect(response.statusCode).toBe(401);
                expect(response.body).toEqual({
                    error: 'Invalid email or password'
                });
            });

            it('should fail login with missing credentials', async () => {
                const response = await request(app)
                    .post('/login')
                    .send({
                        email: 'test@example.com'
                    });
                
                expect(response.statusCode).toBe(400);
                expect(response.body).toEqual({
                    error: 'Email and password are required'
                });
            });
        });
    });


    describe('Recipes API', () => {
        describe('GET /api/recipes/suggest', () => {
            it('should return a list of recipes based on inventory and preferences', async () => {
                const response = await request(app)
                    .get('/api/recipes/suggest')
                    .query({ email: 'test@example.com' });

                expect(response.statusCode).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
                response.body.forEach(recipe => {
                    expect(recipe).toHaveProperty('id');
                    expect(recipe).toHaveProperty('title');
                });
            });

            it('should return 404 for a non-existent user', async () => {
                const response = await request(app)
                    .get('/api/recipes/suggest')
                    .query({ email: 'nonexistent@example.com' });

                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({
                    error: 'User not found'
                });
            });
        });

        describe('GET /api/recipes/:id', () => {
            it('should return recipe details for a valid recipe ID', async () => {
                const response = await request(app)
                    .get('/api/recipes/1');

                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('id');
                expect(response.body).toHaveProperty('title');
                expect(response.body).toHaveProperty('instructions');
            });

            it('should handle errors gracefully for invalid recipe ID', async () => {
                const response = await request(app)
                    .get('/api/recipes/999999');

                expect(response.statusCode).toBe(500);
                expect(response.body).toEqual({
                    error: 'Failed to fetch recipe details'
                });
            });
        });

        describe('GET /api/recipes/expiring', () => {
            it('should return recipes based on expiring inventory items', async () => {
                const response = await request(app)
                    .get('/api/recipes/expiring')
                    .query({ email: 'test@example.com' });

                expect(response.statusCode).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
                response.body.forEach(recipe => {
                    expect(recipe).toHaveProperty('id');
                    expect(recipe).toHaveProperty('title');
                });
            });

            it('should return 404 for a non-existent user', async () => {
                const response = await request(app)
                    .get('/api/recipes/expiring')
                    .query({ email: 'nonexistent@example.com' });

                expect(response.statusCode).toBe(404);
                expect(response.body).toEqual({
                    error: 'User not found'
                });
            });

            it('should return an empty array if no items are nearing expiry', async () => {
                resetDatabase();
                const response = await request(app)
                    .get('/api/recipes/expiring')
                    .query({ email: 'test@example.com' });

                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual({
                    message: 'No items nearing expiry',
                    recipes: []
                });
            });
        });
    });
});