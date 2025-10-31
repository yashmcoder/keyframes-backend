import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allow requests from your frontend domain
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Alternative dev port
  process.env.FRONTEND_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values

const isDev = process.env.NODE_ENV !== 'production';

// In development be permissive (helps with 127.0.0.1 vs localhost and other dev hosts)
const corsOptions = isDev
  ? { origin: true, credentials: true }
  : {
      origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Log origin for debugging
        // (you can remove this log once things are working)
        console.log('CORS request from origin:', origin);

        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.pages.dev')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    };

app.use(cors(corsOptions));

// Ensure preflight OPTIONS requests are handled for all routes
app.options('*', cors(corsOptions));

app.use(express.json());

// Path to JSON file
const submissionsFile = path.join(__dirname, 'contact-submissions.json');

// Ensure file exists
if (!fs.existsSync(submissionsFile)) {
  fs.writeFileSync(submissionsFile, JSON.stringify([], null, 2));
}

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️  Email configuration error:', error.message);
    console.log('📧 Email notifications are disabled. Please check:');
    console.log('   1. Gmail App Password is correct (16 characters, no spaces)');
    console.log('   2. 2-Step Verification is enabled on your Google account');
    console.log('   3. Generate new App Password at: https://myaccount.google.com/apppasswords');
  } else {
    console.log('✅ Email server is ready to send messages');
    console.log(`📧 Notifications will be sent to: ${process.env.EMAIL_TO || process.env.EMAIL_USER}`);
  }
});

// POST endpoint to save contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const submissionData = {
      ...req.body,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    // Read existing submissions
    const existingData = JSON.parse(fs.readFileSync(submissionsFile, 'utf-8'));
    
    // Add new submission
    existingData.push(submissionData);
    
    // Write back to file
    fs.writeFileSync(submissionsFile, JSON.stringify(existingData, null, 2));
    
    console.log('New submission saved:', submissionData);
    
    // Send email notification
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_TO || process.env.EMAIL_USER,
          subject: `New Contact: ${submissionData.name} - ${submissionData.service}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                      
                      <!-- Colorful Top Stripe -->
                      <tr>
                        <td style="padding: 0; margin: 0; height: 4px; background: linear-gradient(90deg, #a855f7 0%, #3b82f6 20%, #22c55e 40%, #ec4899 60%, #f97316 80%, #a855f7 100%);">
                        </td>
                      </tr>
                      
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">
                            New Contact Submission
                          </h1>
                          <p style="margin: 0; font-size: 14px; color: #6b7280;">
                            ${new Date(submissionData.timestamp).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          
                          <!-- Contact Details -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                            
                            <!-- Name -->
                            <tr>
                              <td style="padding: 16px; background-color: #f9fafb; border-left: 3px solid #a855f7; margin-bottom: 12px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="24" valign="top" style="padding-right: 12px;">
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                      </svg>
                                    </td>
                                    <td>
                                      <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Name</p>
                                      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${submissionData.name}</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            
                            <tr><td style="height: 12px;"></td></tr>
                            
                            <!-- Email -->
                            <tr>
                              <td style="padding: 16px; background-color: #f9fafb; border-left: 3px solid #3b82f6;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="24" valign="top" style="padding-right: 12px;">
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                      </svg>
                                    </td>
                                    <td>
                                      <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Email</p>
                                      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                                        <a href="mailto:${submissionData.email}" style="color: #3b82f6; text-decoration: none;">${submissionData.email}</a>
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            
                            <tr><td style="height: 12px;"></td></tr>
                            
                            <!-- Service -->
                            <tr>
                              <td style="padding: 16px; background-color: #f9fafb; border-left: 3px solid #22c55e;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="24" valign="top" style="padding-right: 12px;">
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                      </svg>
                                    </td>
                                    <td>
                                      <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Service Interest</p>
                                      <p style="margin: 0;">
                                        <span style="display: inline-block; padding: 6px 14px; background-color: #d1fae5; color: #065f46; font-size: 14px; font-weight: 600; border-radius: 6px;">
                                          ${submissionData.service}
                                        </span>
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Message Section -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                            <tr>
                              <td style="padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="24" valign="top" style="padding-right: 12px;">
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                      </svg>
                                    </td>
                                    <td>
                                      <p style="margin: 0 0 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Message</p>
                                      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151; white-space: pre-wrap;">${submissionData.message}</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- CTA Button -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center" style="padding: 20px 0;">
                                <a href="mailto:${submissionData.email}?subject=Re: Your inquiry about ${submissionData.service}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(168, 85, 247, 0.25);">
                                  REPLY TO ${submissionData.name.split(' ')[0].toUpperCase()}
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                          <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">
                            Automated notification from your Video Editing Agency
                          </p>
                          <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                            Submission ID: ${submissionData.id}
                          </p>
                        </td>
                      </tr>
                      
                    </table>
                  </td>
                </tr>
              </table>
              
            </body>
            </html>
          `,
          text: `
New Contact Form Submission

Name: ${submissionData.name}
Email: ${submissionData.email}
Service: ${submissionData.service}
Time: ${new Date(submissionData.timestamp).toLocaleString()}

Message:
${submissionData.message}

---
Reply to: ${submissionData.email}
Submission ID: ${submissionData.id}
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email notification sent successfully');
      }
    } catch (emailError) {
      console.error('⚠️  Email sending failed:', emailError.message);
      // Continue even if email fails
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Submission saved successfully',
      data: submissionData 
    });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving submission' 
    });
  }
});

// GET endpoint to retrieve all submissions
app.get('/api/contact', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(submissionsFile, 'utf-8'));
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error reading submissions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reading submissions' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Submissions will be saved to: ${submissionsFile}`);
});
