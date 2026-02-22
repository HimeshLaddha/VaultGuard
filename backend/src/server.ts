import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app';
import { seedDatabase } from './store';

const PORT = parseInt(process.env.PORT || '5000', 10);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vaultguard';

async function startServer() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Successfully connected to MongoDB.');

        // Seed default data
        await seedDatabase();

        app.listen(PORT, () => {
            console.log(`\nVaultGuard API running on http://localhost:${PORT}`);
            console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
            console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

startServer();
