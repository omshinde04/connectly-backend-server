export const config = {
    runtime: 'nodejs', // ✅ IMPORTANT for Vercel
};

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/db';
import User from '../../../models/User';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectDB();

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields required' });
        }

        // ✅ CHECK EXISTING USER FIRST
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // ✅ HASH PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ CREATE USER
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // ✅ SAFETY CHECK
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is missing');
        }

        // ✅ CREATE TOKEN
        const token = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // ✅ CLEAN RESPONSE (NO MONGOOSE DOC)
        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error('🔥 SIGNUP ERROR 👉', error.message);
        console.error(error.stack);

        return res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
}
