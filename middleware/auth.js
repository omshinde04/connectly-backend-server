import jwt from 'jsonwebtoken';
import User from '../models/User';
import connectDB from '../lib/db';

export default async function authenticate(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Unauthorized');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new Error('Invalid token');
    }

    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
        throw new Error('Unauthorized');
    }

    // attach user to request
    req.user = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
    };

    return user;
}
