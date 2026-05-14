# Zivora Commerce

Full-stack ecommerce scaffold with a React + Vite storefront and an Express + MongoDB API.

## Stack

- Frontend: React, Vite, React Router, Context API, Axios, Tailwind CSS, Swiper, react-hot-toast
- Backend: Node.js, Express, MongoDB, Mongoose, JWT auth, role-based access, multer, Cloudinary
- Quality: Jest, Supertest, ESLint, GitHub Actions
- Deployment: Docker, docker-compose, nginx, mongo-express

## Folder Tree

```text
ecommerce-app
├─ .github/
│  └─ workflows/
│     └─ ci.yml
├─ client/
│  ├─ Dockerfile
│  ├─ nginx.conf
│  ├─ .env.example
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package.json
│  ├─ vite.config.js
│  └─ src/
│     ├─ api/
│     │  └─ client.js
│     ├─ components/
│     │  ├─ common/
│     │  ├─ layout/
│     │  └─ products/
│     ├─ context/
│     ├─ data/
│     ├─ hooks/
│     ├─ pages/
│     ├─ router/
│     ├─ utils/
│     ├─ App.jsx
│     ├─ index.css
│     └─ main.jsx
├─ server/
│  ├─ Dockerfile
│  ├─ .env.example
│  ├─ eslint.config.js
│  ├─ jest.config.js
│  ├─ package.json
│  ├─ postman/
│  │  └─ ecommerce.postman_collection.json
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ utils/
│  │  ├─ app.js
│  │  └─ index.js
│  └─ tests/
│     ├─ auth.test.js
│     ├─ product.test.js
│     └─ setup.js
├─ shared/
│  └─ types/
│     ├─ ecommerce.d.ts
│     └─ index.d.ts
├─ .env.example
├─ .gitignore
└─ docker-compose.yml
```

## Backend Features

- Mongoose models for `User`, `Category`, `Product`, `Order`, `Review`, and refresh-token blocklist
- Pre-save hooks for password hashing, slug generation, and tracking IDs
- Virtuals and indexes for common query paths
- Static review aggregation to recompute product average ratings
- JWT auth with 15 minute access tokens and 7 day refresh cookies
- Role guards for admin routes
- Product pagination, filtering, text search, and slug detail lookup
- Review creation with one-review-per-user-per-product enforcement
- Order creation with stock reservation inside a Mongo transaction
- Helmet, CORS whitelist, rate limiting, mongo sanitization, XSS cleaning, compression, and centralized error handling

## Frontend Features

- Route-based code splitting with `React.lazy` and `Suspense`
- `AuthContext` and `CartContext`
- `useProducts`, `useOrders`, `useDebounce`, and intersection observer image loading
- Home, Products, Product Detail, Cart, Checkout, Auth, Dashboard, and Admin pages
- Skeleton states, toast notifications, Swiper gallery, and a mobile-friendly layout
- Fallback preview data so the UI still renders if the API is offline

## Local Setup

### 1. Copy env files

Use the root or per-app examples:

```bash
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

### 2. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 3. Run the apps

In one terminal:

```bash
cd server
npm run dev
```

In another terminal:

```bash
cd client
npm run dev
```

Frontend default: `http://localhost:5173`

API default: `http://localhost:5000`

## Docker

Bring up the full stack:

```bash
docker compose up --build
```

Services:

- Client: `http://localhost:8080`
- API: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`
- Mongo Express: `http://localhost:8081`

## Testing

Server tests use Jest + Supertest with `mongodb-memory-server` in replica-set mode:

```bash
cd server
npm test
```

## Deployment Notes

### Render

- Deploy the server as a Node web service
- Set `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_ORIGIN`, and any Cloudinary or SMTP keys
- Deploy the client as a static site with `VITE_API_URL` pointing at the Render API URL

### Railway

- Create separate services for `server` and `client`
- Attach MongoDB or point `MONGO_URI` at an external cluster
- Set the same JWT, CORS, Cloudinary, and SMTP variables as above

## Postman

Import:

`server/postman/ecommerce.postman_collection.json`

## Notes

- Product image uploads support Cloudinary when credentials are present, and graceful placeholder URLs when they are not.
- The frontend includes fallback mock data for UI preview mode, but checkout, profile updates, and admin mutations need the API running.
