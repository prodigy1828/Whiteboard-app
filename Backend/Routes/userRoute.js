const express = require('express');
const {registerUser,loginUser,getUserProfile} = require('../controllers/userController');
const router = express.Router();

router.post('/register', (req, res) => {
    registerUser(req, res);
});

router.post('/login', (req, res) => {
    loginUser(req, res);
});

router.get('/profile', (req, res) => {
    getUserProfile(req, res);
});

module.exports = router;