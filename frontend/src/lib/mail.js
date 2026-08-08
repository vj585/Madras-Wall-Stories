import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;
  
  const mailOptions = {
    from: `"Madras Prints" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email - Madras Prints",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          }
          .header {
            background-color: #000000;
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.025em;
          }
          .content {
            padding: 40px 32px;
            text-align: center;
          }
          .content p {
            color: #374151;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .btn {
            display: inline-block;
            background-color: #000000;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.2s;
          }
          .btn:hover {
            background-color: #1f2937;
          }
          .footer {
            padding: 24px;
            text-align: center;
            background-color: #f9fafb;
            border-top: 1px solid #f3f4f6;
          }
          .footer p {
            color: #9ca3af;
            font-size: 14px;
            margin: 0;
          }
          .fine-print {
            color: #6b7280;
            font-size: 13px;
            margin-top: 32px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Madras Prints</h1>
          </div>
          <div class="content">
            <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Welcome to the family!</h2>
            <p>Thank you for creating an account with Madras Prints. We're excited to help you turn your blank walls into emotional stories.</p>
            <p>Please verify your email address to activate your account and start shopping.</p>
            
            <div style="margin: 32px 0;">
              <a href="${verifyUrl}" class="btn">Verify Email Address</a>
            </div>
            
            <p class="fine-print">This link will expire in 15 minutes.<br>If you did not create this account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Madras Prints. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendAdminOTP = async (email, otp, action) => {
  const actionText = action === 'ADD_ADMIN' ? 'adding a new administrator' : 'removing an administrator';
  
  const mailOptions = {
    from: `"Madras Prints Security" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: `Admin Action OTP - Madras Prints`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background-color: #000000; padding: 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 20px; }
          .content { padding: 40px 32px; text-align: center; }
          .otp-box { display: inline-block; background-color: #f3f4f6; padding: 16px 32px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0; color: #000000; }
          .footer { padding: 24px; text-align: center; background-color: #f9fafb; border-top: 1px solid #f3f4f6; color: #9ca3af; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Madras Prints Admin Security</h1>
          </div>
          <div class="content">
            <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Authorization Required</h2>
            <p style="color: #374151; font-size: 16px;">You have requested an OTP for <strong>${actionText}</strong>.</p>
            <p style="color: #374151; font-size: 16px;">Please use the following 6-digit code to confirm this action:</p>
            
            <div class="otp-box">${otp}</div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">This OTP is valid for 10 minutes.<br>If you did not request this, please secure your account immediately.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Madras Prints. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

