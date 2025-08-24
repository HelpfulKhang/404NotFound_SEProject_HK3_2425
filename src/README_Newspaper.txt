Digital Newspaper Website - Setup Instructions and System Overview
==================================================================

PROJECT SUMMARY
---------------
This project is a modern, full-featured digital newspaper platform. It enables users to read, search, and interact with news articles, while also supporting content creation, editorial review, user management, and analytics.

KEY MODULES
-----------
1. User Roles:
   - Reader (read, comment, rate, share)
   - Writer (create & submit articles)
   - Editor (review, approve, manage articles)
   - Admin (system-wide management)

2. Core Features (22 total):
   - Read, search, filter, save, and recommend articles
   - Article creation, editing, approval, and multimedia content
   - Commenting with moderation, rating system
   - User registration/login/logout, password recovery via OTP
   - Light/Dark theme toggle
   - Dashboard with analytics and usage statistics
   - Plagiarism check for writers/editors

TECH STACK
----------
- Frontend: React.js
- Backend: Node.js (Express or NestJS)
- Database: PostgreSQL
- Auth: JWT, OAuth 2.0 (Google, Facebook)
- Media Storage: AWS S3 or MinIO
- Analytics: Google Analytics / Matomo
- Email Gateway: SendGrid / SMTP
- Deployment: Docker, Docker Compose

INSTALLATION INSTRUCTIONS
-------------------------
1. Clone repository:
   git clone https://github.com/your-org/digital-newspaper.git
   cd digital-newspaper

2. Setup environment variables:
   cp .env.example .env
   cd client && cp .env.example .env
   cd ../server && cp .env.example .env

3. Start development environment:
   docker-compose up --build

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000/api

TESTING
-------
Frontend:
   cd client
   npm run test

Backend:
   cd server
   npm run test

API OVERVIEW
------------
- Base URL: /api
- Modules:
  - /auth - login, register, reset password
  - /articles - create, read, update, delete, search, filter
  - /comments - post, moderate
  - /users - manage roles, profile
  - /analytics - track views, ratings

DATABASE
--------
- Uses PostgreSQL (via Docker)
- To initialize schema:
  docker exec -it newspaper_db psql -U postgres -d newspaper -f /docker-entrypoint-initdb.d/init.sql

SECURITY FEATURES
-----------------
- Account lockout after 3 failed attempts (30 min)
- OTP for password recovery (expires after 30s)
- MFA optional for sensitive actions
- Session timeout and HTTPS enforced

PERFORMANCE TARGETS
--------------------
- Page load < 3s
- Search/filter response < 2s
- 10,000+ concurrent users supported

DEPLOYMENT (PRODUCTION)
-----------------------
- Prepare production .env files
- Push Docker images to cloud registry
- Deploy via AWS ECS/Fargate or GCP Cloud Run
- Setup HTTPS and domain

DOCUMENTATION INCLUDED
----------------------
- API documentation (docs/API.md)
- System architecture diagram
- User manual and admin guide
- Test plan and deployment guide

PROJECT CONTRIBUTORS
--------------------
- Trần Hữu Khang – Project Manager
- Nguyễn Tấn Lộc – Backend Developer
- Lê Đình Minh Quân – Frontend Developer
- Thạch Ngọc Hân – Tester
- Lê Thị Minh Thư – Tester & Business Analyst