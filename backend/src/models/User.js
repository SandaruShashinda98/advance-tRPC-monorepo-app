import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PERMISSIONS, hasPermission, checkOwnership } from '../utils/permissions.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  directPermissions: [{
    type: String,
    enum: Object.values(PERMISSIONS)
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get all user permissions (from roles + direct permissions)
userSchema.methods.getAllPermissions = async function() {
  await this.populate('roles');

  const permissions = new Set();

  // Add permissions from roles
  this.roles.forEach(role => {
    if (role.isActive) {
      role.permissions.forEach(permission => {
        permissions.add(permission);
      });
    }
  });

  // Add direct permissions
  this.directPermissions.forEach(permission => {
    permissions.add(permission);
  });

  return Array.from(permissions);
};

// Check if user has specific permission
userSchema.methods.hasPermission = async function(requiredPermission, context = {}) {
  const userPermissions = await this.getAllPermissions();
  
  return hasPermission(userPermissions, requiredPermission, {
    ...context,
    userId: this._id
  });
};

// Don't return password in JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export const User = mongoose.model('User', userSchema);