## Description

This is a backend coding assignment for Testlio that implements a RESTful API to manage software testing issues. The API is built with **Node.js**, **Koa**, **Sequelize**, and **MySQL**, and runs in a Dockerized environment. It allows authenticated users to create, update, and retrieve issues, with full revision tracking for auditability. JWT-based authentication and `X-Client-ID` headers are required for all endpoints (except health/discovery). Revisions are stored on creation and update, and can be compared via a dedicated endpoint to highlight field-level differences.

All requirements have been implemented, including:

* Creating, listing, and modifying issues.
* Tracking and storing issue revisions.
* JWT authentication and `X-Client-ID` validation. (must be included in the header of every request)
* Storing author email (`created_by`, `updated_by`) for each change.
* Comparing two revisions with a detailed change summary.
* Dockerized setup for seamless environment management.

