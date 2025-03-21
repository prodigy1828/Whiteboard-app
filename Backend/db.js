const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to database: ${connection.connection.name}`);
    }catch(error){
        console.log('Error connecting to database:', error.message);
        process.exit(1);
    }
};

module.exports = connectToDatabase;