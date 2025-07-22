const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Create a user
const createUser = async (req, res) => {
    const { name, email } = req.body;
    try {
        const user = await prisma.user.create({
        data: { name, email },
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get single user by ID
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user' });
    }
};

// Update user by ID
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    try {
        const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { name, email },
        });

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete user by ID
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.user.delete({
        where: { id: parseInt(id) },
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
};
