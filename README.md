# Keyframe Studios - Backend

Express.js backend API for handling contact form submissions and email notifications.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation
```bash
npm install
```

### Configuration
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your environment variables in `.env`:
```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=recipient@gmail.com

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Gmail Setup
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Create an app password for "Mail"
5. Use that 16-character password as `EMAIL_PASS`

### Development
```bash
node api.js
```
Server runs on `http://localhost:3001`

## 🌐 Deployment

### Recommended Platforms
- **Railway** - https://railway.app
- **Render** - https://render.com
- **Vercel** - https://vercel.com
- **Heroku** - https://heroku.com

### Environment Variables
Set these in your hosting platform:
- `EMAIL_SERVICE` - Email provider (gmail, outlook, yahoo)
- `EMAIL_USER` - Your email address
- `EMAIL_PASS` - Your app password
- `EMAIL_TO` - Recipient email address
- `PORT` - Server port (usually auto-set)
- `FRONTEND_URL` - Your frontend URL (e.g., `https://your-site.pages.dev`)

### Railway Deployment
1. Connect your GitHub repository
2. Select the `backend` folder as root directory
3. Add environment variables
4. Deploy!

## 📁 Project Structure
```
backend/
├── api.js                    # Express server
├── package.json             # Dependencies
├── .env.example             # Environment template
├── contact-submissions.json # Saved submissions
└── EMAIL_SETUP.md          # Email configuration guide
```

## 🛠️ API Endpoints

### POST /api/contact
Submit a contact form
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "service": "Corporate Videos",
  "message": "I need video editing services"
}
```

## 🔒 CORS Configuration
The backend accepts requests from:
- `http://localhost:5173` (development)
- `http://localhost:3000`
- Any `*.pages.dev` domain (Cloudflare Pages)
- Custom `FRONTEND_URL` from environment variables
