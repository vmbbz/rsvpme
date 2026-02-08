# SMTP Email Debugging Checklist

## Issue: Emails work locally but not in production

### ✅ Local Testing (Working)
1. Submit RSVP at http://localhost:3000
2. Check server console for detailed logging
3. Verify email arrives at mutsekwatb@gmail.com

### 🔍 Production Debugging Steps

#### 1. Check Vercel Environment Variables
Go to your Vercel dashboard → Project → Settings → Environment Variables and verify:

```
GMAIL_USER=cosychiruka@gmail.com
GMAIL_PASS=kdts fzze tbmq yysr
RSVP_EMAIL=mutsekwatb@gmail.com
```

**Common Issues:**
- Missing variables
- Typos in variable names
- Incorrect password (use app password, not regular password)

#### 2. Check Vercel Function Logs
1. Go to Vercel dashboard → Project → Functions
2. Look for recent function executions
3. Check for error messages in logs

#### 3. Test Production Logging
1. Submit RSVP on your live site
2. Check Vercel logs for these messages:
   - 🔍 Starting email send process...
   - 📧 Environment: production
   - 📧 Gmail user configured: YES/NO
   - 📧 Gmail pass configured: YES/NO
   - ✅ Transporter verified successfully
   - 📧 Email sent successfully: [message ID]

#### 4. Common Gmail SMTP Issues

**Authentication Errors:**
- Ensure 2FA is enabled on cosychiruka@gmail.com
- Use the 16-character app password (not regular password)
- Check if app password is still valid

**Connection Issues:**
- Gmail might block less secure apps temporarily
- Try generating a new app password
- Check Gmail account for security alerts

**Rate Limiting:**
- Gmail allows ~500 emails/day for regular accounts
- Unlikely to be hit for wedding RSVPs

#### 5. Alternative Solutions

If Gmail SMTP continues to fail:
1. Use a different Gmail account
2. Try Google Workspace account (2000 emails/day limit)
3. Consider email services like SendGrid, Mailgun

### 📊 Enhanced Logging Added

The server now logs:
- Environment detection (development vs production)
- Gmail configuration status
- Transporter verification
- Detailed error messages with codes
- Email send results with message IDs

### 🚀 Next Steps

1. **Test locally first** - confirm enhanced logging works
2. **Deploy to Vercel** - push the enhanced logging
3. **Check Vercel logs** - submit test RSVP on production
4. **Compare logs** - local vs production differences
5. **Fix environment variables** if configuration is missing

The enhanced logging will show exactly where the production email sending is failing!
