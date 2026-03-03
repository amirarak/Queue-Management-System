const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Analytics = sequelize.define('analytics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  
  totalTickets: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_tickets'
  },
  
  completedTickets: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'completed_tickets'
  },
  
  cancelledTickets: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'cancelled_tickets'
  },
  
  avgWaitTime: {
    type: DataTypes.INTEGER,
    field: 'avg_wait_time'
  },
  
  avgServiceTime: {
    type: DataTypes.INTEGER,
    field: 'avg_service_time'
  },
  
  peakHour: {
    type: DataTypes.INTEGER,
    field: 'peak_hour'
  }
}, {
  indexes: [
    { fields: ['date'] }
  ]
});

module.exports = Analytics;