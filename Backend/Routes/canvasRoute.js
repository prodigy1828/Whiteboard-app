const express = require('express');
const { getAllCanvases, createCanvas, loadCanvas,updateCanvas,shareCanvas, deleteCanvas } = require('../controllers/canvasController');
const authenticationMiddleware = require('../middlewares/authentication');
const router = express.Router();

router.get('/', authenticationMiddleware, (req, res) => {
    getAllCanvases(req, res);
});

router.post('/', authenticationMiddleware, (req, res) => {
    createCanvas(req, res);
});

router.get('/load/:id', authenticationMiddleware, loadCanvas);

router.put('/update/:id', authenticationMiddleware,updateCanvas);

router.post('/share/:id', authenticationMiddleware, (req, res) => {
    shareCanvas(req, res);
});

router.delete('/erase/:id', authenticationMiddleware, (req, res) => {
    deleteCanvas(req, res);
});

module.exports = router;