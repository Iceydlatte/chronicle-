# Harz Chronicle — Minimal Blogging Platform

A minimal, full‑stack blogging app with image uploads, comments, saved posts, and JWT‑based auth. Built with Express + MongoDB on the backend and a simple Bootstrap/vanilla JS frontend.

## Features

- Posts: create, read, update, delete (CRUD)
- Image uploads for posts (multer), served from `/uploads`
- Comments on posts
- Auth: register/login with bcrypt + JWT (token stored client‑side)
- Saved posts per user (server‑side) with local fallback when logged out
- Views counter per post
- Clean, single‑page front end (index.html) with Bootstrap styling
- Optimistic publish: new posts show immediately then sync with server

## Tech stack

- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Auth: JWT (jsonwebtoken), password hashing with bcrypt
- File uploads: multer
- Frontend: static HTML (Bootstrap 5), vanilla JS (`public/app.js`)

## Project structure

```
.
├─ server.js                 # Express app entry (serves API + static frontend)
├─ routes/
│  ├─ posts.js               # Posts CRUD, views, save/unsave, uploads
│  ├─ users.js               # Register, login, list users (debug)
│  └─ comments.js            # Create/list comments for a post
├─ models/
│  ├─ Post.js                # title, content, author, imageUrl, savedBy[], views
│  ├─ User.js                # name, email, passwordHash
│  └─ Comment.js             # post, authorName, content
├─ public/
│  ├─ index.html             # Main UI (posts list, editor, saved modal, view modal)
│  ├─ login.html             # Login (glowing text styling)
│  ├─ register.html          # Register (glowing text styling)
│  ├─ app.js                 # Shared API/auth helpers and UI utilities
│  └─ assets/                # Background images, icons, etc.
└─ uploads/                  # Generated at runtime for uploaded images
```

## Getting started

1) Install dependencies

```powershell
npm install
```

2) Configure environment

Create a `.env` file in the project root with at least:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blog_platform
JWT_SECRET=change-me-in-production
```

3) Run the app

```powershell
# Dev (auto-restart)
npm run dev

# Or production mode
npm start
```

Then open http://localhost:3000

## API quick reference

Base URL: `http://localhost:3000/api`

Posts
- GET `/posts` — list posts (newest first)
- GET `/posts/:id` — get a post by id
- POST `/posts` — create post (multipart/form-data)
   - Fields: `title` (string), `content` (string), `image` (file, optional)
   - If `Authorization: Bearer <token>` is provided, the post’s `author` is set from the token
- PUT `/posts/:id` — update post
- DELETE `/posts/:id` — delete post (removes its comments and uploaded image file if present)
- POST `/posts/:id/views` — increment and return `{ views }`
- POST `/posts/:id/save` — save post for current user (requires Bearer token)
- POST `/posts/:id/unsave` — unsave post for current user (requires Bearer token)

Comments
- GET `/posts/:postId/comments` — list comments for a post
- POST `/posts/:postId/comments` — create comment `{ authorName, content }`

Users / Auth
- POST `/users/register` — `{ name, email, password }` → `{ user, token }`
- POST `/users/login` — `{ email, password }` → `{ user, token }`
- GET `/users` — list users (password hashes are omitted)

Auth notes
- Send `Authorization: Bearer <token>` for protected actions (save/unsave, author attribution on create)
- Token expires in 30 days by default (configurable in code)

## Frontend notes

- The app auto‑detects the API base when served locally and supports running straight from the filesystem for simple demos.
- A “Saved (N)” button opens a modal listing saved posts; a “View” button shows post details in a modal.
- The UI includes subtle glowing text for login/register headings and labels.

## Troubleshooting

- “MongoDB connection error”: verify `MONGODB_URI` and that MongoDB is running/accessible.
- “EADDRINUSE: port 3000”: change `PORT` in `.env` or stop the existing process.
- Image uploads not appearing: ensure the `uploads/` directory is writable (it’s created at runtime).

## Deployment

- Set `NODE_ENV=production` and provide production values for `MONGODB_URI` and `JWT_SECRET`.
- Serve behind a reverse proxy (e.g., Nginx) and enable HTTPS.
- Configure a persistent volume for the `uploads/` directory if you need to keep images.

## Contributing

Issues and PRs are welcome. Please open an issue describing the change you’re proposing.

## License

MIT. See `package.json` for the license declaration. Consider adding a `LICENSE` file for GitHub to detect it automatically.
