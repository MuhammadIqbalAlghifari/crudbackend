const express = require('express'); // Import Express framework
const router = express.Router(); // Create a new router object
const User = require('./models/users'); // Import the User model
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for generating tokens

// Route for user registration
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body; // Extract user details from the request body

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with bcrypt

        // Create a new user object
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save(); // Save the user to the database

        res.status(201).json({
            message: 'user registered' // Respond with success message
        });
    } catch (error) {
        console.error(error); // Log error to console
        return res.status(500).json({
            message: 'server internal 500 error' // Respond with error message
        });
    }
});

// Route for user logout
router.post('/logout', async (req, res) => {
    try {
        const { token } = req.body; // Extract token from request body

        // Remove the token from the user's tokens array
        await User.updateOne(
            { "tokens.token": token },
            { $pull: { tokens: { token: token } } }
        );

        res.clearCookie('token').send('user logged out'); // Clear the cookie and send logout response
    } catch (error) {
        console.error(error); // Log error to console
        return res.status(500).json({
            message: 'server internal 500 error' // Respond with error message
        });
    }
});

// Route for user login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; // Extract email and password from request body

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' }); // User not found
        }

        // Compare provided password with hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' }); // Password does not match
        }

        // Generate a new token
        const token = jwt.sign({ userId: user._id }, 'XOfWtoQPeW4FLHRNO-JskJ6uRK9binNQ8DeNDN6eGSHZxBmMMz29nhhfH3NJ9814', { expiresIn: '24h' });

        // Remove old tokens
        user.tokens = [];
        // Add the new token
        user.tokens.push({ token });

        await user.save(); // Save updated user with new token

        res.json({ token, userId: user._id }); // Respond with the new token and user ID
    } catch (error) {
        console.error(error); // Log error to console
        return res.status(500).json({ message: 'Internal server error' }); // Respond with error message
    }
});

// Route to add a new item to a user's items array
router.post('/:userId/add-item', async (req, res) => {
    try {
        const { userId } = req.params; // Extract user ID from URL parameters
        const { name, description, status } = req.body; // Extract item details from request body

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // User not found
        }

        user.items.push({ name, description, status }); // Add the new item to the user's items array

        await user.save(); // Save updated user

        res.status(200).json(user.items); // Respond with updated items list
    } catch (error) {
        console.error('Error while adding the item:', error); // Log error to console
        return res.status(500).json({ message: 'Internal server error' }); // Respond with error message
    }
});

// Route to get all items for a user
router.post('/:userId/items-list', async (req, res) => {
    try {
        const { userId } = req.params; // Extract user ID from URL parameters

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // User not found
        }

        res.json(user.items); // Respond with user's items list
    } catch (error) {
        console.error('Error while fetching items:', error); // Log error to console
        return res.status(500).json({ message: 'Internal server error' }); // Respond with error message
    }
});

// Route to get a specific item by ID for a user
router.post('/:userId/items/:itemId', async (req, res) => {
    try {
        const { userId, itemId } = req.params; // Extract user ID and item ID from URL parameters

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // User not found
        }

        const item = user.items.id(itemId); // Find the item by ID within the user's items array

        if (!item) {
            return res.status(404).json({ message: 'Item not found' }); // Item not found
        }

        res.json(item); // Respond with the specific item
    } catch (error) {
        console.error('Error while fetching the item:', error); // Log error to console
        return res.status(500).json({ message: 'Internal server error' }); // Respond with error message
    }
});

// Route to update a specific item by ID for a user
router.patch('/:userId/update-item/:itemId', async (req, res) => {
    try {
        const { userId, itemId } = req.params; // Extract user ID and item ID from URL parameters
        const { name, description, status } = req.body; // Extract updated item details from request body

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // User not found
        }

        const item = user.items.id(itemId); // Find the item by ID within the user's items array

        if (!item) {
            return res.status(404).json({ message: 'Item not found' }); // Item not found
        }

        // Update item details
        item.name = name;
        item.description = description;
        item.status = status;

        await user.save(); // Save updated user with modified item

        res.status(200).json(item); // Respond with updated item
    } catch (error) {
        console.error('Error while updating the item:', error); // Log error to console
        return res.status(500).json({ message: 'Internal server error' }); // Respond with error message
    }
});

// Route to delete a specific item by ID for a user
router.delete('/:userId/delete-item/:itemId', async (req, res) => {
    try {
        const { userId, itemId } = req.params; // Extract user ID and item ID from URL parameters

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // User not found
        }

        const item = user.items.id(itemId); // Find the item by ID within the user's items array

        if (!item) {
            return res.status(404).json({ message: 'Item not found' }); // Item not found
        }

        // Remove the item from the user's items array
        user.items.pull({ _id: itemId });

        await user.save(); // Save updated user with the item removed

        res.status(200).json({ message: 'Item deleted' }); // Respond with success message
    } catch (error) {
        console.error('Error while deleting the item:', error); // Log error to console
        return res.status(500).json({ message: 'Internal server error' }); // Respond with error message
    }
});

module.exports = router; // Export the router for use in other parts of the application
