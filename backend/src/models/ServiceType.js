const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceType = sequelize.define('service_types', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  
  avgServiceTime: {
    type: DataTypes.INTEGER,
    defaultValue: 300,
    field: 'avg_service_time'
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
});

module.exports = ServiceType;