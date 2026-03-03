const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('departments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  
  nameEn: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'name_en'
  },
  
  nameRu: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'name_ru'
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
});

module.exports = Department;