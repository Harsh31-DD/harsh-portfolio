require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); // Add rate limiting

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for rate limiting (for demo; use Redis in production)
const requestCounts = new Map();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for now to debug the contact form issue
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Rate limiting: 5 requests per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many contact form submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create transporter for Gmail SMTP with improved configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
    // Add timeout and retry configuration
    timeout: 60000, // 60 seconds
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    // Enable debug logging
    debug: true,
    logger: true
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
        console.log('🔧 Please check your Gmail credentials and app password');
        console.log('📧 Make sure "Less secure app access" is enabled in Gmail settings');
        console.log('🔑 Regenerate your Gmail app password if needed');
    } else {
        console.log('✅ Email transporter is ready to send messages');
    }
});

// Test mail function
async function sendTestMail() {
    try {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER, // Send to yourself
            subject: 'Test Mail from Portfolio Bot',
            text: 'This is a test email to confirm the contact form setup is working correctly.\n\nPortfolio Contact System: ✅ Operational'
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully to', process.env.GMAIL_USER);
    } catch (error) {
        console.error('❌ Test email failed:', error.message);
    }
}

// Apply rate limiting to contact route
app.use('/contact', contactLimiter);

// Contact form POST route
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Enhanced validation
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Name validation (at least 2 characters, no special chars)
    if (name.length < 2 || name.length > 100) {
        return res.status(400).json({ error: 'Name must be between 2 and 100 characters.' });
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
        return res.status(400).json({ error: 'Name can only contain letters and spaces.' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Message validation
    if (message.length < 10 || message.length > 2000) {
        return res.status(400).json({ error: 'Message must be between 10 and 2000 characters.' });
    }

    try {
        // Mail options
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER, // Send to the configured email
            subject: `New Contact Form Submission from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}\n\n---\nSent from Portfolio Website`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <hr>
                    <p style="color: #666; font-size: 12px;">Sent from your portfolio website contact form.</p>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Message Sent Successfully ✅' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email. Please try again later.' });
    }
});

// Basic route
app.get('/', (req, res) => {
    res.send('Contact API is running.');
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Send test mail on startup
    console.log('Sending test email to verify setup...');
    await sendTestMail();
});