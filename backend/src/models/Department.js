const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('departments', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code:     { type: DataTypes.STRING(10),  allowNull: false, unique: true },
  nameRu:   { type: DataTypes.STRING(255), allowNull: false, field: 'name_ru' },
  nameEn:   { type: DataTypes.STRING(255), allowNull: false, field: 'name_en' },
  nameKy:   { type: DataTypes.STRING(255), allowNull: false, field: 'name_ky' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' }
});

module.exports = Department;