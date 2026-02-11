import connectDB from '../../../lib/db';
import User from '../../../models/User';
import authenticate from '../../../middleware/auth';

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const currentUser = await authenticate(req);
        await connectDB();

        // ❌ exclude logged-in user
        const users = await User.find({
            _id: { $ne: currentUser._id },
        }).select('_id name email');

        res.status(200).json(users);
    } catch (error) {
        console.error('GET USERS ERROR 👉', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
}
