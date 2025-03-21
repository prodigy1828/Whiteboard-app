const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticationMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.email) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = await User.getUser(decoded.email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authenticationMiddleware;
