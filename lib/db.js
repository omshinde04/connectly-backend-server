import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!process.env.MONGODB_URI) {
        throw new Error('❌ Please define MONGODB_URI in .env');
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(process.env.MONGODB_URI, {
                bufferCommands: false,
            })
            .then((mongoose) => {
                console.log('✅ MongoDB connected');
                return mongoose;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
