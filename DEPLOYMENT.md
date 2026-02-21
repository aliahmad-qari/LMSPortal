# Deployment Guide

Follow these steps to deploy your Smart University LMS to production.

## 1. Backend (Render)

### Steps:
1.  **New Web Service**: Create a new Web Service on [Render](https://render.com/).
2.  **Connect Repo**: Connect your GitHub repository.
3.  **Config**:
    - **Root Directory**: `server`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
4.  **Environment Variables**:
    - `MONGO_URI`: `mongodb+srv://ali-islamic:xlUR8DWnt7jpcw2M@cluster0.0nsjvku.mongodb.net/Lms?retryWrites=true&w=majority`
    - `JWT_SECRET`: (Create a secure random string, e.g., `a7k2_9Js_!m1P`)
    - `CLIENT_URL`: `https://lms-portal-black-six.vercel.app`
    - `PORT`: `10000` (Render will usually set this automatically)

---

## 2. Frontend (Vercel)

### Steps:
1.  **New Project**: Import your repository on [Vercel](https://vercel.com/).
2.  **Root Directory**: Leave it as the root (`./`).
3.  **Build Settings**:
    - **Framework Preset**: `Vite`
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
4.  **Environment Variables**:
    - `VITE_API_URL`: `https://lmsportal-9e5c.onrender.com/api`

---

## 3. Post-Deployment Checks
- Once Render is up, copy its URL and update `VITE_API_URL` in Vercel.
- Once Vercel is up, copy its URL and update `CLIENT_URL` in Render.
- **IMPORTANT**: If changes don't take effect immediately, push all latest code changes to your GitHub and ensure Render/Vercel redeploys.

## 4. Troubleshooting
- **Login Failed**: Ensure you have run `npm run seed` to create the Admin user.
- **Role Issues**: All roles are now forced to UPPERCASE (e.g., ADMIN, INSTRUCTOR). The system now automatically handles this.
