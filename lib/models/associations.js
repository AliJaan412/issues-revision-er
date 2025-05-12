'use strict';

module.exports = function setupAssociations(sequelize) {
  // Get the models
  const Issue = sequelize.models.issue;
  const Revision = sequelize.models.revision;

  // Verify models exist
  if (!Issue) throw new Error('Issue model not found in sequelize.models');
  if (!Revision) throw new Error('Revision model not found in sequelize.models');

  // Set up associations
  Issue.hasMany(Revision, {
    foreignKey: 'issue_id',
    as: 'revisions'
  });

  Revision.belongsTo(Issue, {
    foreignKey: 'issue_id',
    as: 'issue'
  });

  console.log('Associations set up successfully');
};