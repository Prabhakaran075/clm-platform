const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const testRegister = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const email = `test_${Date.now()}@example.com`;
        console.log(`Attempting to register: ${email}`);

        const user = await User.create({
            name: 'Test Registry',
            email: email,
            password: 'password123',
            role: 'StoreOwner'
        });

        console.log('Registration Successful:', user);
        process.exit();
    } catch (error) {
        console.error('Registration Failed:', error);
        process.exit(1);
    }
};

testRegister();
