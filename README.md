# Minimal Blogging Platform

This project is a minimal blogging platform example with:

- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Frontend: static `public/index.html` using Bootstrap + plain JS (simple editor + comments)

Quick start:

1. Install dependencies

   npm install

2. Create a `.env` file (or set env vars). See `.env.example`.

3. Start MongoDB locally or use a connection string, then run:

  npm run dev    # (requires nodemon) or
   npm start

4. Open http://localhost:3000 in your browser.

APIs (JSON):

- GET  /api/posts                - list posts
- POST /api/posts                - create post { title, content }
- GET  /api/posts/:id            - get post
- PUT  /api/posts/:id            - update post
- DELETE /api/posts/:id          - delete post (also removes comments)
- POST /api/posts/:postId/comments - add comment { authorName, content }
- GET  /api/posts/:postId/comments - list comments
- POST /api/users                - create user { name, email }
- GET  /api/users                - list users

Notes:
- This is intentionally minimal. Add authentication, validation, sanitization, and pagination for production use.
