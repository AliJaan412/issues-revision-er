"use strict";
const respond = require("./responses");
const Issue = require("../models/issue");
const Revision = require("../models/revision");

const Issues = {};

function parsePositiveInt(value) {
  if (!/^\d+$/.test(String(value))) return null;
  return parseInt(value, 10);
}

function validateIssuePayload(body, { partial = false } = {}) {
  const errors = [];
  const { title, description } = body || {};

  if (!partial || title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      errors.push("title is required and must be a non-empty string");
    } else if (title.length > 100) {
      errors.push("title must be 100 characters or fewer");
    }
  }

  if (!partial || description !== undefined) {
    if (typeof description !== "string" || description.trim().length === 0) {
      errors.push("description is required and must be a non-empty string");
    }
  }

  return errors;
}

Issues.get = async (ctx) => {
  const id = parsePositiveInt(ctx.params.id);
  if (id === null) return respond.badRequest(ctx, ["id must be a positive integer"]);

  try {
    const issue = await Issue.findByPk(id, {
      include: [{
        model: Revision,
        as: 'revisions', // This should match your association alias
        required: false, // Makes it a LEFT JOIN (returns issue even with no revisions)
        order: [['updated_at', 'DESC']] // Order revisions newest first
      }]
    });

    if (!issue) {
      return respond.notFound(ctx);
    }

    respond.success(ctx, { 
      issue: {
        ...issue.get({ plain: true }),
        revisions: issue.revisions || []
      }
    });
  } catch (error) {
    console.error('Error fetching issue with revisions:', error);
    respond.error(ctx, 'Failed to retrieve issue data');
  }
};

Issues.create = async (ctx) => {
  const validationErrors = validateIssuePayload(ctx.request.body);
  if (validationErrors.length) return respond.badRequest(ctx, validationErrors);

  try {
    const { title, description } = ctx.request.body;
    const createdBy = ctx.state.user?.email || "unknown";

    // Creating a new issue
    const newIssue = await Issue.create({
      title,
      description,
      created_by: createdBy,
      updated_by: createdBy,
      created_at: new Date(),
      updated_at: new Date(),
    });
    respond.success(ctx, newIssue);
  } catch (error) {
    console.error("Error creating issue:", error);
    respond.error(ctx, "An error occurred while creating the issue.");
  }
};

// List all issues
Issues.list = async (ctx) => {
  try {
    const issues = await Issue.findAll();
    respond.success(ctx, issues);
  } catch (error) {
    console.error("Error fetching issues:", error);
    respond.error(ctx, "Failed to fetch issues.");
  }
};

// Updating the issue
Issues.update = async (ctx) => {
  const id = parsePositiveInt(ctx.params.id);
  if (id === null) return respond.badRequest(ctx, ["id must be a positive integer"]);

  const validationErrors = validateIssuePayload(ctx.request.body, { partial: true });
  if (validationErrors.length) return respond.badRequest(ctx, validationErrors);

  try {
    const issue = await Issue.findByPk(id);
    if (!issue) return respond.notFound(ctx);

    const { title, description } = ctx.request.body;
    const changes = {};
  
    if (title && title !== issue.title) {
      changes.title = title;
    }
  
    if (description && description !== issue.description) {
      changes.description = description;
    }
  
    if (Object.keys(changes).length > 0) {
      const updatedBy = ctx.state.user?.email || 'unknown';
  
      // Create a new revision entry
      await Revision.create({
        issue_id: issue.id,
        changes: changes,
        updated_by: updatedBy,
        updated_at: new Date(),
      });
    }
  
    respond.success(ctx, { message: 'Revision recorded successfully.' });
  } catch (error) {
    console.error("Error recording revision:", error);
    respond.error(ctx, "An error occurred while recording the revision.");
  }
};


// Getting all revisions of a specific issue
Issues.revisions = async (ctx) => {
  const id = parsePositiveInt(ctx.params.id);
  if (id === null) return respond.badRequest(ctx, ["id must be a positive integer"]);

  try {
    // Find the issue by ID to verify it exists
    const issue = await Issue.findByPk(id);
    if (!issue) return respond.notFound(ctx);

    // Find all revisions associated with this issue
    const revisions = await Revision.findAll({
      where: {
        issue_id: id
      },
      order: [
        ['updated_at', 'DESC'] // Most recent first
      ]
    });

    // Respond with the revisions
    respond.success(ctx, { revisions });
  } catch (error) {
    console.error("Error fetching revisions:", error);
    respond.error(ctx, "Failed to retrieve revisions");
  }
};

// Compare two revisions from the revisions table
Issues.compareRevisions = async (ctx) => {
  const issueId = parsePositiveInt(ctx.params.id);
  const revisionAId = parsePositiveInt(ctx.params.revisionA);
  const revisionBId = parsePositiveInt(ctx.params.revisionB);

  if (issueId === null || revisionAId === null || revisionBId === null) {
    return respond.badRequest(ctx, ["id, revisionA and revisionB must be positive integers"]);
  }

  try {
    // Fetch both revisions by ID and issue_id
    const [revisionA, revisionB] = await Promise.all([
      Revision.findOne({ where: { id: revisionAId, issue_id: issueId } }),
      Revision.findOne({ where: { id: revisionBId, issue_id: issueId } }),
    ]);

    if (!revisionA || !revisionB) {
      return respond.notFound(ctx);
    }

    const changesA = revisionA.changes || {};
    const changesB = revisionB.changes || {};

    const differences = {};
    const allKeys = new Set([...Object.keys(changesA), ...Object.keys(changesB)]);

    allKeys.forEach((key) => {
      const valueA = changesA[key];
      const valueB = changesB[key];
      if (valueA !== valueB) {
        differences[key] = { from: valueA, to: valueB };
      }
    });

    respond.success(ctx, {
      revisionA: {
        id: revisionA.id,
        updated_by: revisionA.updated_by,
        updated_at: revisionA.updated_at,
        changes: changesA,
      },
      revisionB: {
        id: revisionB.id,
        updated_by: revisionB.updated_by,
        updated_at: revisionB.updated_at,
        changes: changesB,
      },
      differences,
    });
  } catch (error) {
    console.error("Error comparing revisions:", error);
    respond.error(ctx, "Failed to compare revisions.");
  }
};

module.exports = Issues;
