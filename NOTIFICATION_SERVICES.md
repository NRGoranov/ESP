# Notification Services Setup Guide

This document explains what notification services you need and how to set them up for the Bulgarian Electricity Prices app.

## Overview

The app supports two types of notifications:
1. **Email Notifications** - Sent when prices exceed user-defined thresholds
2. **Push Notifications** - Browser/web push notifications for real-time alerts

## Email Notification Services

### Option 1: Resend (Recommended for simplicity)

**Why Resend?**
- Simple API
- Good free tier (3,000 emails/month)
- Great developer experience
- Built for transactional emails

**Setup Steps:**

1. **Sign up**: Go to [resend.com](https://resend.com) and create an account

2. **Get API Key**:
   - Go to API Keys section
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Verify Domain** (for production):
   - Add your domain in Resend dashboard
   - Add DNS records as instructed
   - Or use Resend's test domain for development

4. **Add to Environment Variables**:
   ```env
   RESEND_API_KEY="re_your_api_key_here"
   ```

5. **Install Resend SDK**:
   ```bash
   npm install resend
   ```

6. **Update `lib/alerts.ts`**:
   ```typescript
   import { Resend } from 'resend'
   
   const resend = new Resend(process.env.RESEND_API_KEY)
   
   export async function sendEmailAlert(alert: UserAlert, records: PriceRecord[]): Promise<void> {
     try {
       await resend.emails.send({
         from: 'alerts@yourdomain.com', // or 'onboarding@resend.dev' for testing
         to: alert.email!,
         subject: `Ценово известие: ${records.length} интервала над ${alert.minPrice} EUR/MWh`,
         html: `
           <h2>Ценово известие</h2>
           <p>Намерени са ${records.length} интервала с цена над ${alert.minPrice} EUR/MWh:</p>
           <ul>
             ${records.map(r => `<li>${r.startTime}-${r.endTime}: ${r.priceEurMwh.toFixed(2)} EUR/MWh</li>`).join('')}
           </ul>
         `,
       })
       console.log(`Email sent to ${alert.email}`)
     } catch (error) {
       console.error('Error sending email:', error)
       throw error
     }
   }
   ```

### Option 2: SendGrid

**Why SendGrid?**
- Industry standard
- 100 emails/day free tier
- Good for high volume

**Setup Steps:**

1. **Sign up**: Go to [sendgrid.com](https://sendgrid.com)

2. **Create API Key**:
   - Settings → API Keys
   - Create API Key with "Mail Send" permissions

3. **Add to Environment Variables**:
   ```env
   SENDGRID_API_KEY="SG.your_api_key_here"
   ```

4. **Install SendGrid SDK**:
   ```bash
   npm install @sendgrid/mail
   ```

5. **Update `lib/alerts.ts`**:
   ```typescript
   import sgMail from '@sendgrid/mail'
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
   
   export async function sendEmailAlert(alert: UserAlert, records: PriceRecord[]): Promise<void> {
     const msg = {
       to: alert.email!,
       from: 'alerts@yourdomain.com',
       subject: `Ценово известие: ${records.length} интервала над ${alert.minPrice} EUR/MWh`,
       html: `...`, // Same HTML as Resend example
     }
     
     await sgMail.send(msg)
   }
   ```

### Option 3: AWS SES

**Why AWS SES?**
- Very cheap ($0.10 per 1,000 emails)
- High deliverability
- Good for enterprise

**Setup Steps:**

1. **AWS Account**: Create AWS account if needed

2. **Create IAM User**:
   - IAM → Users → Create user
   - Attach "AmazonSESFullAccess" policy
   - Create access key

3. **Add to Environment Variables**:
   ```env
   AWS_ACCESS_KEY_ID="your_access_key"
   AWS_SECRET_ACCESS_KEY="your_secret_key"
   AWS_REGION="eu-central-1"
   ```

4. **Install AWS SDK**:
   ```bash
   npm install @aws-sdk/client-ses
   ```

5. **Update `lib/alerts.ts`**:
   ```typescript
   import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
   
   const sesClient = new SESClient({
     region: process.env.AWS_REGION,
     credentials: {
       accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
     },
   })
   
   export async function sendEmailAlert(alert: UserAlert, records: PriceRecord[]): Promise<void> {
     const command = new SendEmailCommand({
       Source: 'alerts@yourdomain.com',
       Destination: { ToAddresses: [alert.email!] },
       Message: {
         Subject: { Data: `Ценово известие: ${records.length} интервала над ${alert.minPrice} EUR/MWh` },
         Body: { Html: { Data: `...` } },
       },
     })
     
     await sesClient.send(command)
   }
   ```

## Push Notification Services

### Option 1: OneSignal (Recommended)

**Why OneSignal?**
- Free tier (10,000 subscribers)
- Easy setup
- Good documentation
- Supports web push, mobile apps

**Setup Steps:**

1. **Sign up**: Go to [onesignal.com](https://onesignal.com)

2. **Create Web Push App**:
   - Dashboard → New App/Website
   - Choose "Web Push"
   - Enter app name and URL

3. **Get Credentials**:
   - Settings → Keys & IDs
   - Copy "App ID" and "REST API Key"

4. **Add to Environment Variables**:
   ```env
   ONESIGNAL_APP_ID="your_app_id"
   ONESIGNAL_REST_API_KEY="your_rest_api_key"
   ```

5. **Install OneSignal SDK**:
   ```bash
   npm install react-onesignal
   ```

6. **Update Service Worker (`public/sw.js`)**:
   ```javascript
   importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js')

   self.addEventListener('push', (event) => {
     const data = event.data ? event.data.json() : {}
     const title = data.title || 'Ценово известие'
     const options = {
       body: data.body || 'Нова цена достигна вашия праг',
       icon: '/icon-192x192.png',
       badge: '/badge-72x72.png',
       data: data.url || '/',
     }

     event.waitUntil(
       self.registration.showNotification(title, options)
     )
   })
   ```

7. **Update `lib/alerts.ts`**:
   ```typescript
   export async function sendPushAlert(alert: UserAlert, records: PriceRecord[]): Promise<void> {
     const response = await fetch('https://onesignal.com/api/v1/notifications', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
       },
       body: JSON.stringify({
         app_id: process.env.ONESIGNAL_APP_ID,
         include_player_ids: [alert.pushToken!],
         contents: {
           en: `Намерени ${records.length} интервала над ${alert.minPrice} EUR/MWh`,
           bg: `Намерени ${records.length} интервала над ${alert.minPrice} EUR/MWh`,
         },
         headings: {
           en: 'Ценово известие',
           bg: 'Ценово известие',
         },
       }),
     })
     
     if (!response.ok) {
       throw new Error('Failed to send push notification')
     }
   }
   ```

8. **Update Alert Creation** (in `components/AlertFormClient.tsx`):
   ```typescript
   // When user enables push, register with OneSignal
   if (enablePush) {
     // Initialize OneSignal (do this once in app)
     OneSignal.init({
       appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
     })
     
     // Get user's push token
     const userId = await OneSignal.getUserId()
     // Store userId as pushToken in database
   }
   ```

### Option 2: Firebase Cloud Messaging (FCM)

**Why FCM?**
- Free
- Google's service
- Good for existing Firebase users

**Setup Steps:**

1. **Firebase Project**: Create at [firebase.google.com](https://firebase.google.com)

2. **Enable Cloud Messaging**:
   - Project Settings → Cloud Messaging
   - Generate Web Push certificates
   - Copy "Web Push certificates" (VAPID key)

3. **Add to Environment Variables**:
   ```env
   FCM_SERVER_KEY="your_server_key"
   FCM_VAPID_KEY="your_vapid_key"
   ```

4. **Install Firebase SDK**:
   ```bash
   npm install firebase
   ```

5. **Update Service Worker and Alert Functions**:
   - Follow Firebase Web Push setup guide
   - Update `lib/alerts.ts` to use FCM REST API

## Summary: What You Need

### Minimum Setup (Email Only)
- **Resend account** (free tier: 3,000 emails/month)
- **RESEND_API_KEY** environment variable
- Update `sendEmailAlert` function in `lib/alerts.ts`

### Full Setup (Email + Push)
- **Resend** for emails
- **OneSignal** for push notifications
- **ONESIGNAL_APP_ID** and **ONESIGNAL_REST_API_KEY** environment variables
- Update both `sendEmailAlert` and `sendPushAlert` functions
- Update service worker registration

## Cost Estimates

- **Resend**: Free up to 3,000 emails/month, then $20/month for 50,000
- **OneSignal**: Free up to 10,000 subscribers
- **SendGrid**: Free up to 100 emails/day
- **AWS SES**: $0.10 per 1,000 emails (very cheap)

## Testing

After setup, test notifications:

1. **Create an alert** via the UI
2. **Manually trigger** the alert cron:
   ```bash
   curl https://your-app.vercel.app/api/cron/send-alerts
   ```
3. **Check logs** in Vercel dashboard for any errors

## Security Notes

- Never commit API keys to git
- Use Vercel environment variables for production
- Consider rate limiting for alert endpoints
- Validate email addresses before sending

