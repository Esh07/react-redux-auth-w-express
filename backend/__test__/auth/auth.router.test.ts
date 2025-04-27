// Import necessary modules
import request from 'supertest';
import { app } from '../../src/app/index'; // Adjust the path as necessary
import { Server } from 'http';
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { execSync } from 'child_process';


// jest.mock('../../src/api/users/users.services'); // Mock the service functions


let server: Server;

const userData = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'password123',
    confirmPassword: 'password123',
};

const loginData = {
    email: 'johndoe@example.com',
    password: 'password123',
};

let refreshToken: string;
let accessToken: string;

// Helper function to register a user
const registerUser = async () => {
    const response = await request(app).post('/auth/register').send(userData);
    return response.body; // Returns accessToken and refreshToken
};

beforeAll(async () => {
    // Initialize the server
    execSync('npx prisma migrate reset --force --skip-seed', {
        stdio: 'inherit',
    });
    server = app.listen(3000, () => {
        console.log('Server started on port 3000');
    });
});

afterAll(async () => {
    console.log('Closing server...');
    // clean the database migration
    execSync('npx prisma migrate reset --force --skip-seed', {
        stdio: 'inherit',
    });
    server.close();
});

describe('Auth Routes', () => {
    describe('POST /auth/register', () => {
        it('should successfully register a new user', async () => {
            const response = await request(app).post('/auth/register').send(userData);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
            });

            accessToken = response.body.accessToken;
            refreshToken = response.body.refreshToken;
        });

        it('should fail to register a user with missing fields', async () => {
            const response = await request(app).post('/auth/register').send({
                email: 'johndoe@example.com',
            });

            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ message: 'Password is required.' }),
                ])
            );
        });
        it('should fail to register a user with an invalid email', async () => {
            const response = await request(app).post('/auth/register').send({
                name: 'John Doe',
                email: 'invalid-email',
                password: 'password123',
                confirmPassword: 'password123',
            });

            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual([{ "code": "invalid_string", "message": "Invalid email", "path": ["email"], "validation": "email" }]);
        });

        it('should fail to register a user when passwords do not match', async () => {
            const response = await request(app).post('/auth/register').send({
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: 'password123',
                confirmPassword: 'password456',
            });

            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ message: 'Passwords do not match.' }),
                ])
            );
        });

        it('should fail to register a user with an existing email', async () => {
            await request(app).post('/auth/register').send(userData);
            const response = await request(app).post('/auth/register').send(userData);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'User with this email already exists.' });
        });
    });

    describe('POST /auth/login', () => {
        beforeAll(async () => {
            const registerResponse = await registerUser();
            accessToken = registerResponse.accessToken;
            refreshToken = registerResponse.refreshToken;
        });

        it('should successfully log in a user', async () => {
            const response = await request(app).post('/auth/login').send(loginData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Logged in successfully.',
                accessToken: expect.any(String),
            });

            accessToken = response.body.accessToken;
        });
        it('should fail to log in with empty fields', async () => {
            const response = await request(app).post('/auth/login').send({
                email: '',
                password: '',
            });

            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual([{ "code": "invalid_string", "message": "Invalid email", "path": ["email"], "validation": "email" }]);
        });

        it('should fail to log in with invalid credentials', async () => {
            const invalidLoginData = { email: 'wrongemail@example.com', password: 'wrongpassword' };
            const response = await request(app).post('/auth/login').send(invalidLoginData);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Invalid email or password.' });
        });
    });

    describe('POST /auth/logout', () => {
        beforeEach(async () => {
            const registerResponse = await registerUser();
            accessToken = registerResponse.accessToken;
            refreshToken = registerResponse.refreshToken;

            // Log in to get the tokens
            const loginResponse = await request(app).post('/auth/login').send(loginData);
            accessToken = loginResponse.body.accessToken;
            refreshToken = loginResponse.body.refreshToken;

        });
        it('should successfully log out a user', async () => {

            const response = await request(app)
                .post('/auth/logout')
                .set('Cookie', [`token=${accessToken}`, `refreshToken=${refreshToken}`]);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Logged out successfully.' });
        }, 1000); // Increased timeout


        it('should fail to log out without a valid token', async () => {

            // logout first then try logout again
            const logoutResponse = await request(app)
                .post('/auth/logout')
                .set('Cookie', [`token=${accessToken}`, `refreshToken=${refreshToken}`]);
            expect(logoutResponse.status).toBe(200);
            expect(logoutResponse.body).toEqual({ message: 'Logged out successfully.' });


            const response = await request(app)
                .post('/auth/logout')
                .set('Cookie', [`token=frfrfrfrfrf`, `refreshToken=frfrfrfrfrf`]);

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: '🚫 Un-Authorized 🚫' });
        }, 1000);
    });
});

describe('GET /user', () => {
    beforeEach(async () => {
        const registerResponse = await registerUser();

        accessToken = registerResponse.accessToken;
        refreshToken = registerResponse.refreshToken;
        const loginResponse = await request(app).post('/auth/login').send(loginData);
        accessToken = loginResponse.body.accessToken;
        refreshToken = loginResponse.body.refreshToken;



    });

    it('should return all users and admin details if the user is an admin', async () => {
        // Mock the user as an admin
        const adminUser = {
            id: 'adminId',
            email: 'admin@example.com',
            name: 'Admin User',
            IsAdmin: true,
        };
        const allUsers = [
            { id: 'user1', email: 'user1@example.com', name: 'User One', IsAdmin: false },
            { id: 'user2', email: 'user2@example.com', name: 'User Two', IsAdmin: false },
        ];


        jest.spyOn(require('../../src/api/users/users.services'), 'getUserDetails').mockResolvedValue(adminUser);
        jest.spyOn(require('../../src/api/users/users.services'), 'getAllUsers').mockResolvedValue(allUsers);

        const response = await request(app)
            .get('/user')
            .set('Cookie', [`token=${accessToken}`]);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            user: adminUser,
            users: allUsers,
        });
    });

    it('should return only the user details if the user is not an admin', async () => {
        // Mock the user as a non-admin
        const regularUser = {
            id: 'userId',
            email: 'user@example.com',
            name: 'Regular User',
            IsAdmin: false,
        };

        jest.spyOn(require('../../src/api/users/users.services'), 'getUserDetails').mockResolvedValue(regularUser);

        const response = await request(app)
            .get('/user')
            .set('Cookie', [`token=${accessToken}`]);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            user: regularUser,
        });
    });
});
