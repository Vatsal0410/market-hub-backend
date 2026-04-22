import nodemailer from "nodemailer";

export const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendOTPEmail = async (email: string, otp: string, type: string) => {
  const subject = type === "password_reset" 
    ? "Password Reset OTP - MarketHub" 
    : type === "email_verification"
    ? "Verify Your Email - MarketHub"
    : "MarketHub OTP";
  
  const html = type === "password_reset"
    ? `
      <html>
        <body>
          <h1>Password Reset Request</h1>
          <p>We received a request to reset your password. Use the verification code below:</p>
          <h2>${otp}</h2>
          <p><strong>Time Sensitive:</strong> This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Stay secure,<br><strong>MarketHub Team</strong></p>
        </body>
      </html>
    `
    : `
      <html>
        <body>
          <h1>Verify Your Email</h1>
          <p>Thank you for registering with MarketHub. Please use the verification code below to verify your email:</p>
          <h2>${otp}</h2>
          <p><strong>Time Sensitive:</strong> This code will expire in 10 minutes.</p>
          <p>If you didn't register, please ignore this email.</p>
          <p>Best,<br><strong>MarketHub Team</strong></p>
        </body>
      </html>
    `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html,
  });
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to MarketHub!",
    html: `
      <html>
        <body>
          <h2>Welcome, ${name}!</h2>
          <p>Thank you for joining MarketHub. Start shopping for fresh groceries today!</p>
        </body>
      </html>
    `,
  });
};