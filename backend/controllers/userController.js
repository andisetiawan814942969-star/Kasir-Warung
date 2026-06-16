const User = require('../models/User');
const { deleteCloudinaryImage } = require('../config/cloudinary');

// @desc    Get all users (admin only)
// @route   GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create user (admin only)
// @route   POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, canEditProfile } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const userData = { 
      name, 
      email, 
      password, 
      role, 
      canEditProfile: role === 'admin' ? true : (canEditProfile === 'true' || canEditProfile === true)
    };
    if (req.file) {
      userData.image = req.file.path;
    }

    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      canEditProfile: user.canEditProfile,
      image: user.image,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role, canEditProfile } = req.body;
    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Mencegah admin mengubah rolenya sendiri menjadi kasir (demote)
    if (role && role !== 'admin' && req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Anda tidak bisa mengubah role Anda sendiri dari Admin' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (role) {
      user.role = role;
      if (role === 'admin') user.canEditProfile = true;
    }
    if (canEditProfile !== undefined && user.role !== 'admin') {
      user.canEditProfile = (canEditProfile === 'true' || canEditProfile === true);
    }
    if (req.file) {
      if (user.image) {
        await deleteCloudinaryImage(user.image);
      }
      user.image = req.file.path;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      canEditProfile: user.canEditProfile,
      image: user.image,
      createdAt: user.createdAt
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    // Prevent deleting self
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (user.image) {
      await deleteCloudinaryImage(user.image);
    }

    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
