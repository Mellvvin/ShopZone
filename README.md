# ShopZone

**A wholesale-commerce platform for Kenyan businesses.** ShopZone brings buyers and suppliers together through one storefront, with browsing, ordering, and platform-managed operations for bulk purchasing.

> **Status:** Active development. This repository contains an evolving MVP; features and production readiness should be verified before deployment.

## Overview

ShopZone is designed for retailers, small businesses, hospitality buyers, institutions, and other customers sourcing goods in wholesale quantities. Buyers shop through ShopZone while suppliers operate behind the platform, keeping the buyer relationship and transaction flow within ShopZone.

The application includes customer shopping and ordering flows, seller-facing tools, and administration features for managing catalogue and operations. See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for the plain-language purpose, workflows, architecture, and current development notes.

## Features

- **Product discovery:** Homepage catalogue, categories, search, featured products, new arrivals, brands, and offers.
- **Buyer accounts:** Registration, sign-in, profile, wishlist, recently viewed items, notifications, and order history.
- **Shopping and orders:** Cart, checkout, shipping information, order records, and order-status views.
- **Wholesale operations:** Product units and minimum-order information, county-based shipping data, and delivery-quote support for eligible orders.
- **Seller tools:** Seller application/status workflows and a seller dashboard for seller-side product and order operations.
- **Administration:** Product, order, user, seller, payment, and enquiry management surfaces.
- **Platform safeguards:** Authenticated API routes, role checks, server-side order and price handling, request sanitization, security headers, and login/registration rate limits.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router, Redux Toolkit, React Bootstrap, Axios |
| Backend | Node.js, Express, CommonJS |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Uploads | Multer; local development storage |
| UI | Component CSS, Bootstrap, React Icons |

## Run locally

### Requirements

- Node.js and npm versions compatible with the installed Vite release
- A MongoDB database and connection string

### Install dependencies

From the repository root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### Configure the backend

Create `backend/.env` and set your own MongoDB connection string. `PORT` is optional; the server defaults to `5000`.

```dotenv
MONGO_URI=<your MongoDB connection string>
PORT=5000
```

Replace the placeholder with a valid connection string. Keep `.env` private; it is ignored by Git.

### Start the application

From the repository root:

```bash
npm run dev
```

This starts the backend and Vite development server together. Open the frontend at `http://localhost:5173`; the API runs at `http://localhost:5000`. Vite proxies `/api` and `/uploads` requests to the backend.

To run only one side, use `npm run server` or `npm run client` from the root.

## Useful commands

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
```

The backend package currently has a placeholder `test` script rather than a configured automated test suite.

## Repository layout

```text
backend/
  config/       Shared backend configuration
  controllers/  Request handling and business logic
  data/         Seed/catalogue and shipping data
  middleware/   Authentication, authorization, sanitization, errors
  models/       Mongoose data models
  routes/       API route definitions
  server.js     Express app and API startup
frontend/
  src/
    components/ Reusable interface components
    data/       Frontend content and configuration
    pages/      Customer, seller, and admin screens
    redux/      Store and feature slices
    utils/      Shared frontend helpers
  vite.config.js
  package.json

documentation/  Project notes, decisions, and roadmaps
package.json   Root development scripts
```

## Development status

ShopZone is an actively developed MVP, not a claim of production readiness. The project notes identify follow-up work, and the current package configuration does not provide a backend test suite. Uploads use local storage in development, while managed production storage and automated M-Pesa/Daraja payment integration remain roadmap items. Review and configure security, payments, storage, and deployment settings before using real customer data or processing live orders.
