//import canvas model from the models folder
const canvas = require('../Models/canvasModel');

//get all canvases for the authenticated user
const getAllCanvases = async (req, res) => {
  // Use the email from the authenticated user
  const email = req.user.email; 
    try {
      // Get all canvases for the user from the database by using the email of the authenticated user
        const canvases = await canvas.getAllCanvasesForUser(email);
        //return the canvases as a JSON response with a status code of 200
        res.status(200).json(canvases);
    } catch (error) {
      //return an error message as a JSON response with a status code of 400
        res.status(400).json({ error: error.message });
    }
};

const createCanvas = async (req, res) => {
  const email = req.user.email; 
  const { name } = req.body;
  try {
    const newCanvas = await canvas.createCanvasForUser(email, name);
    res.status(201).json(newCanvas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loadCanvas = async (req, res) => {
  const email = req.user.email; 
  const { id } = req.params;
  try {
    const canvasData = await canvas.loadCanvas(email, id);
    res.status(200).json(canvasData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCanvas = async (req, res) => {
  const email = req.user.email; 
  const { id } = req.params;
  const { elements } = req.body;
  try {
    const updatedCanvas = await canvas.updateCanvas(email, id, elements);
    res.status(200).json(updatedCanvas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const shareCanvas = async (req, res) => {
  // Use the email from the authenticated user
  const email = req.user.email; 
  // Get the canvas ID and sharedWith list from the request body
  const { id } = req.params;
  const { sharedWith } = req.body;
  try {
    // Share the canvas with the specified users
    // and return the updated canvas data
    const updatedCanvas = await canvas.shareCanvas(email, id, sharedWith);
    res.status(200).json(updatedCanvas);
  } catch (error) {
    // Handle any errors that occur during the sharing process
    res.status(400).json({ error: error.message });
  }
}

const deleteCanvas = async (req, res) => {
  const email = req.user.email;
  const { id } = req.params;

  try {
      const deletedCanvas = await canvas.deleteCanvas(email, id);
      res.status(200).json({ message: 'Canvas deleted successfully', canvas: deletedCanvas });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

module.exports = { getAllCanvases, createCanvas, loadCanvas ,updateCanvas,shareCanvas, deleteCanvas};