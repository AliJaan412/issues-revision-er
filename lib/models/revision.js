'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Revision = sequelize.define('revision', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  issue_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  changes: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  updated_by: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'revisions',
  timestamps: false,
});

module.exports = Revision;
