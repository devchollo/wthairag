import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';

dotenv.config();

const seedAdmin = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/worktoolshub';
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected for Seeding');

        const email = 'devchollo@gmail.com';
        const passwordPlain = 'Fuckthisfacebook28!';
        const name = 'Kent Sevillejo';

        // Check if user exists
        let user = await User.findOne({ email });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordPlain, salt);

        if (user) {
            console.log('User already exists, updating to Admin...');
            user.password = hashedPassword;
            user.isAdmin = true;
            user.isOwner = true;
            user.name = name;
            user.isVerified = true;
            await user.save();
            console.log('User updated to Admin successfully.');
        } else {
            console.log('Creating new Admin user...');
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                isAdmin: true,
                isOwner: true,
                isVerified: true
            });
            console.log('Admin user created successfully.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedAdmin();
