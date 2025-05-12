'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('revisions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      issue_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      issue: {
        type: Sequelize.JSON,
        allowNull: false
      },
      changes: {
        type: Sequelize.JSON,
        allowNull: false
      },
      updated_by: {
        type: Sequelize.STRING,
        defaultValue: 'unknown'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('revisions');
  }
};
