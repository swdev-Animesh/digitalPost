import User from '../models/User.js';


// Test route to check MongoDB write capabilities
export const testCreateUserHandler = async (req, res) => {
  try {
    const randomNum = Math.floor(Math.random() * 10000);
    
    // Generate dummy user data matching your schema fields
    const dummyData = {
      clerkId: `user_test_${randomNum}`,
      email: `testuser_${randomNum}@example.com`,
      name: `Test User ${randomNum}`,
      profileImage: 'https://img.clerk.com/default-profile.png',
    };

    console.log('Attempting to create dummy user in MongoDB:', dummyData);

    const newUser = await User.create(dummyData);

    console.log('Successfully created user in MongoDB:', newUser._id);

    return res.status(201).json({
      success: true,
      message: 'Dummy user successfully created in MongoDB!',
      data: newUser,
    });
  } catch (error) {
    console.error('FAILED to create dummy user in MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: 'Database write failed',
      error: error.message,
    });
  }
};