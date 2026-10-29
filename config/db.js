import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    console.log(`[Mendx MongoDB] Connected Successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Mendx MongoDB] Connection Error: ${error.message}`);
    console.error(`[Mendx MongoDB] TIP: Make sure MongoDB is running locally (e.g. 'mongod' or MongoDB Windows Service)`);
    console.error(`[Mendx MongoDB] OR provide a MongoDB Atlas cloud URI in backend/.env: MONGO_URI=mongodb+srv://...`);
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Mendx MongoDB] Disconnected from database.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Mendx MongoDB] Database error: ${err.message}`);
});
