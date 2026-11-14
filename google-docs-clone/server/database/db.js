import mongoose from 'mongoose';

const Connection = async () => {
    const URL = process.env.MONGO_URI || `mongodb://127.0.0.1:27017/google-docs-clone`;

    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(URL);
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Error while connecting with the database ', error);
    }
}

export default Connection;
