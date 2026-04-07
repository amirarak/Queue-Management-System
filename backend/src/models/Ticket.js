const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ticket = sequelize.define('tickets', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  ticketNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'ticket_number'
  },

  ticketCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'ticket_code'
  },

  studentName: {
    type: DataTypes.STRING(255),
    defaultValue: 'Студент',
    field: 'student_name'
  },

  purposeKey: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'purpose_key'
  },

  purpose: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM('waiting', 'serving', 'completed', 'cancelled'),
    defaultValue: 'waiting',
    allowNull: false
  },

  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'department_id'
  },

  serviceTypeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'service_type_id'
  },

  servedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'served_by'
  },

  windowNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'window_number'
  },

  qrCode:      { type: DataTypes.TEXT,    allowNull: true, field: 'qr_code' },
  calledAt:    { type: DataTypes.DATE,    allowNull: true, field: 'called_at' },
  completedAt: { type: DataTypes.DATE,    allowNull: true, field: 'completed_at' },
  waitTime:    { type: DataTypes.INTEGER, allowNull: true, field: 'wait_time' },
  serviceTime: { type: DataTypes.INTEGER, allowNull: true, field: 'service_time' },
  notes:       { type: DataTypes.TEXT,    allowNull: true }
}, {
  indexes: [
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['ticket_number'] },
    { fields: ['department_id'] }
  ]
});

module.exports = Ticket;