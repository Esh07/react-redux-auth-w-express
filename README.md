<div align="center">

# 🔐 React Redux Auth + Express

**Full-stack authentication app with role-based user management**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)

</div>

---

## Overview

A full-stack authentication system demonstrating JWT-based auth with HTTP-only cookies, refresh token rotation, admin-only user management, and a responsive React/TypeScript frontend.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Clone the repository](#clone-the-repository)
  - [Setting up the API (backend)](#setting-up-the-api-backend)
  - [Setting up the React app (frontend)](#setting-up-the-react-app-frontend)

### Features

- **RESTful API**:

  - **User Authentication**:
    - Register: POST `/user/register`
    - Login: POST `/user/login`
    - Logout: POST `/user/logout`

  - **User Management**:
    - **Admin Capabilities**:
      - View a list of all users: GET `/user` (admin only)
      - Update user information: PUT `/user/:id` (admin only)
      - Delete a user: DELETE `/user/:id` (admin only)
    - **Self-Management**:
      - View current user details: GET `/user`
      - Update own profile: PUT `/user/profile` (Partialy code implemented, not fully functional - test pending)

  - **JWT-based Authentication**:
    - **Access Token**:
      - Stored in an HTTP-only cookie.
      - Expires in 3 hours (configurable).
    - **Refresh Token**:
      - Stored in an HTTP-only cookie.
      - Expires in 24 hours (configurable).

- **React App**:
  - **User Interface**:
    - User Registration & Login Form
    - User List (admin only)
    - User Profile (current user only)
    - Admin Actions:
      - Update user information
      - Delete users
  - **State Management**:
    - Redux Toolkit (RTK)
  - **Responsive Design**:
    - Mobile-first (mobile-friendly) design
    - Responsive UI layouts

## Installation

The installation process is divided into two parts:
  - setting up the API (backend - express app)
  - setting up the React app.

#### Prerequisites

- Node.js (v20.10.0 or higher)
- npm

#### Clone the repository

```bash
git clone https://github.com/Esh07/react-redux-auth-w-express.git
cd react-redux-auth-w-express
```

This command will clone the repository to your local machine. Navigate to the project directory, which contains two subdirectories: `backend` and `frontend-app`.

#### Setting up the API (backend)

Follow the installation instructions from [backend/README.md](backend/README.md).

#### Setting up the React app (frontend)

Follow the installation instructions from [frontend-app/README.md](frontend-app/README.md).
