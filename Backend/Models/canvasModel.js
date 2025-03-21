const mongoose = require('mongoose');

const canvasSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    elements: [{type : mongoose.Schema.Types.Mixed}],
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true 
});

canvasSchema.index({ owner: 1 });
canvasSchema.index({ sharedWith: 1 });

//get all
canvasSchema.statics.getAllCanvasesForUser = async function(email) {
    try {
        //find the user with the given email from anywhere in the database
        const user = await mongoose.model('User').findOne({ email });
        //if the user is not found return an empty array
        if (!user) {
            return Error('User not found');
        }
        //find all canvases where the owner is the user or the user is shared with(an array of users)
        const canvases = await this.find({
            $or: [
                { owner: user._id },
                { sharedWith: user._id }
            ]
        });
        return canvases; 
    } catch(error) {
        throw new Error('Error getting canvases: ' + error.message);
    }
};

canvasSchema.statics.createCanvasForUser = async function(email, name) {
    //find the user with the given email from anywhere in the database
    const user = await mongoose.model('User').findOne({ email });
    //if the user is not found return an empty array
    try{    
    if (!user) {
        throw new Error('User not found');
    }
    //create a new canvas with the given name and the user as the owner
    const canvas = new this({
        name,
        owner: user._id,
        elements: [],
        sharedWith: [],
        lastModifiedBy: user._id
    });
    //save the canvas to the database
    const newCanvas = await canvas.save();
    //return the new canvas
    return newCanvas;
    //if the canvas is not saved return an error message
    }catch(error) { 
        throw new Error('Error creating canvas: ' + error.message);
    }
};

canvasSchema.statics.loadCanvas = async function(email, canvasId) {
    const user = await mongoose.model('User').findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    const canvas = await this.findOne({
        _id: canvasId,
        $or: [
            { owner: user._id },
            { sharedWith: user._id }
        ]
    });
    if (!canvas) {
        throw new Error('Canvas not found');
    }
    return canvas;
};

canvasSchema.statics.getCanvasForUser = async function(canvasId) {
    try {
        const canvas = await this.findById(canvasId);
        if (!canvas) {
            throw new Error('Canvas not found');
        }
        return canvas;
    } catch (error) {
        throw new Error('Error getting canvas: ' + error.message);
    }
};

canvasSchema.statics.updateCanvas = async function(email, id, elements) {
    const user = await mongoose.model('User').findOne({ email });
    try{
        if (!user) {
            throw new Error('User not found');
        }
        const canvas = await this.findOne(
            {
                _id: id,
                $or: [
                    { owner: user._id },
                    { sharedWith: user._id }
                ]
            }
        );
        if (!canvas) {
            throw new Error('Canvas not found');
        }
        canvas.elements = elements;
        const updatedCanvas = await canvas.save();
        return updatedCanvas;}
    catch(error) {
        throw new Error('Error updating canvas: ' + error.message);
    }
};

//share canvas with another user
canvasSchema.statics.shareCanvas = async function(ownerEmail, canvasId, sharedWithEmail) {
    try {
        // Find the owner user
        const owner = await mongoose.model('User').findOne({ email: ownerEmail });
        if (!owner) {
            throw new Error('Owner not found');
        }

        // Find the user to share with
        const sharedUser = await mongoose.model('User').findOne({ email: sharedWithEmail });
        if (!sharedUser) {
            throw new Error('User to share with not found');
        }

        // Find the canvas
        const canvas = await this.findOne({
            _id: canvasId,
            owner: owner._id
        });

        if (!canvas) {
            throw new Error('Canvas not found');
        }

        // Check if already shared
        if (canvas.sharedWith.includes(sharedUser._id)) {
            throw new Error('Canvas already shared with this user');
        }

        // Add user to sharedWith array
        canvas.sharedWith.push(sharedUser._id);
        const updatedCanvas = await canvas.save();
        return updatedCanvas;

    } catch (error) {
        throw new Error('Error sharing canvas: ' + error.message);
    }
};

canvasSchema.statics.deleteCanvas = async function(email, canvasId) {
    try {
        // Find the user
        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        // Find and delete the canvas (only if user is the owner)
        const canvas = await this.findOneAndDelete({
            _id: canvasId,
            owner: user._id
        });

        if (!canvas) {
            throw new Error('Canvas not found or you do not have permission to delete it');
        }

        return canvas;
    } catch (error) {
        throw new Error('Error deleting canvas: ' + error.message);
    }
};

const Canvas = mongoose.model('Canvas', canvasSchema);

module.exports = Canvas;
