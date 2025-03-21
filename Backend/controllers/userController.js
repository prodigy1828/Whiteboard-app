const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel');
require('dotenv').config(); 

const JWT_SECRET = process.env.JWT_SECRET; 

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const new_user = await userModel.register(name, email, password);
        res.status(201).json(new_user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new Error('Email and Password are required');
        }
        const user = await userModel.login(email, password);
        const token = jwt.sign({ email: user.email }, JWT_SECRET);

        return res.status(200).json({
            message: 'User logged in successfully',
            token: token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getUserProfile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization token is required' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        if(!decoded || !decoded.email){
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = await userModel.getUser(decoded.email);
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: "User Profile Retrieved Successfully",
            user: {
                id: user._id,
                name: user.name, 
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};