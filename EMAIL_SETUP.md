# 📧 Email Setup Guide

## Quick Setup (Gmail)

1. **Open the `.env` file** in the `server` folder

2. **Update with your email:**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_TO=your-email@gmail.com
   ```

3. **Get Gmail App Password:**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification" (if not already enabled)
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and generate a password
   - Copy the 16-character password (remove spaces)
   - Paste it as `EMAIL_PASS` in `.env`

4. **Save the `.env` file**

5. **Restart the server:**
   ```bash
   cd server
   node api.js
   ```

## What You'll Receive

Every contact form submission will send you a beautifully formatted email with:
- ✉️ Sender's name and email
- 🎬 Service they're interested in
- 💬 Their message
- ⏰ Timestamp
- 🔗 Quick reply button

## Email Template Preview

The email includes:
- Colorful gradient header (purple/blue)
- Organized sections with all submission details
- Direct reply link
- Professional formatting
- Plain text fallback for email clients

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-password
```

### Custom SMTP
```env
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

## Testing

1. Fill out the contact form on your website
2. Check your email inbox
3. You should receive a formatted email notification

## Troubleshooting

**"Invalid login" error:**
- Make sure you're using an App Password, not your regular password
- Check that 2-Step Verification is enabled

**No emails received:**
- Check spam/junk folder
- Verify EMAIL_TO is correct
- Check server logs for error messages

**Server shows "Email notifications disabled":**
- Make sure `.env` file exists in `server` folder
- Verify all EMAIL_ variables are set correctly
- Restart the server after changes

## Security Notes

- ⚠️ Never commit `.env` file to git
- ✅ `.env` is already in `.gitignore`
- 🔒 Keep your app password secure
- 📝 Use `.env.example` as a template
