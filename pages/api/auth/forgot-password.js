import crypto from 'crypto';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import { sendResetEmail } from '../../../lib/sendEmail';


export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email required' });
    }

    try {
        await connectDB();

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 🔐 Generate secure token
        const resetToken = crypto.randomBytes(32).toString('hex');

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min

        await user.save();
        // inside try block
        await sendResetEmail(user.email, resetToken);

        res.status(200).json({
            message: 'Password reset link sent to email',
        });
        // ⚠️ In real app → send email
        console.log('RESET TOKEN:', resetToken);

        res.status(200).json({
            message: 'Password reset link sent',
            resetToken, // for testing only
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}
