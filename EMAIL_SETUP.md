# Email Setup Guide for RSVP Notifications

## Overview
Your RSVP system now automatically sends beautiful email notifications when guests submit their RSVP. Here's how to configure it:

## Step 1: Configure Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account (if not already enabled)
2. **Create an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" for the app
   - Select "Other (Custom name)" and enter "Wedding RSVP"
   - Copy the 16-character password (this is your `GMAIL_PASS`)

## Step 2: Update Environment Variables

Edit your `.env.local` file and replace the placeholder values:

```env
# Gmail SMTP Configuration for RSVP Emails
GMAIL_USER=your-actual-gmail-address@gmail.com
GMAIL_PASS=your-16-character-app-password
RSVP_EMAIL=your-rsvp-notification-email@gmail.com
```

- `GMAIL_USER`: The Gmail address that will send emails
- `GMAIL_PASS`: The 16-character app password (NOT your regular password)
- `RSVP_EMAIL`: Where you want to receive RSVP notifications

## Step 3: Restart Your Server

After updating the environment variables, restart your server:

```bash
npm run server
```

## What Happens Next

When a guest submits an RSVP:
1. ✅ Their response is saved to the database
2. ✅ A beautiful HTML email is sent to your notification address
3. ✅ The email includes:
   - Guest name and party size
   - Who they're attending with
   - Additional information (dietary requirements, etc.)
   - Timestamp of submission
4. ✅ Console logs confirm email delivery

## Email Design

The notification emails feature:
- Elegant vintage styling matching your wedding theme
- Clear guest information layout
- Professional formatting
- Mobile-responsive design

## Troubleshooting

**If emails don't send:**
1. Verify your Gmail app password is correct
2. Check that 2FA is enabled on your Gmail account
3. Ensure the Gmail user and password match exactly
4. Check server console for error messages

**If you get "login failed" errors:**
- Double-check you're using the App Password (16 characters), not your regular Gmail password
- Make sure 2FA is enabled on the account

## Testing

To test the email functionality:
1. Start your server with the updated environment variables
2. Submit a test RSVP through your website
3. Check your notification email inbox
4. Verify the email contains all guest details

The system is now ready to send you instant notifications whenever guests RSVP to your wedding! 💌
