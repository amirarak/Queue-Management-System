const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  username: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },

  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'full_name'
  },

  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'staff',
    allowNull: false
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },

  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified'
  },

  verificationToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'verification_token'
  },

  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password && !user.password.startsWith('$2')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && !user.password.startsWith('$2')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.verificationToken;
  return values;
};

module.exports = User;