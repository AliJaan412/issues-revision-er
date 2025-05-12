'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Issue = sequelize.define('issue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'unknown',
  },
  updated_by: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'unknown',
  },
}, {
  tableName: 'issues',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Issue;
