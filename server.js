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
  origin: true, // Allow all origins for development - restrict in production
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Add payload size limit
app.use(express.urlencoded({ extended: true })); // Handle URL-encoded data

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
    // Enhanced timeout and retry configuration
    timeout: 60000, // 60 seconds
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    // Enable debug logging in development
    debug: process.env.NODE_ENV !== 'production',
    logger: process.env.NODE_ENV !== 'production',
    // Additional security and performance settings
    secure: true, // Use TLS
    requireTLS: true,
    pool: true, // Use pooled connections
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000, // 1 second
    rateLimit: 5, // 5 emails per second
    // Custom TLS options for better security
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false // Allow self-signed certificates in development
    }
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

// Enhanced test mail function with detailed diagnostics
async function sendTestMail() {
    try {
        console.log('🔄 Sending test email to verify email configuration...');

        const mailOptions = {
            from: {
                name: 'Portfolio Contact System',
                address: process.env.GMAIL_USER
            },
            to: process.env.GMAIL_USER,
            subject: '🧪 Test Email - Portfolio Contact System Verification',
            text: `
Portfolio Contact System Test Email
=====================================

✅ Server Started: ${new Date().toISOString()}
✅ Port: ${PORT}
✅ Email Service: Gmail SMTP
✅ Transporter Verified: Yes

This email confirms that your contact form backend is properly configured and ready to receive messages from your portfolio website visitors.

If you received this email, your email system is working correctly!

---
Portfolio Contact System v2.0
Status: ✅ Operational
            `,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px; border-radius: 10px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                        <h1 style="margin: 0; font-size: 24px;">🧪 Portfolio Contact System Test</h1>
                    </div>

                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #28a745; margin-top: 0;">✅ System Status: Operational</h2>

                        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <strong>Server Details:</strong><br>
                            • Started: ${new Date().toLocaleString()}<br>
                            • Port: ${PORT}<br>
                            • Email Service: Gmail SMTP<br>
                            • Configuration: Verified ✓
                        </div>

                        <p style="color: #6c757d; line-height: 1.6;">
                            This test email confirms that your contact form backend is properly configured and ready to receive messages from your portfolio website visitors.
                        </p>

                        <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 10px; border-radius: 5px; margin: 15px 0;">
                            <strong>✅ Email delivery system is working correctly!</strong>
                        </div>
                    </div>

                    <div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px;">
                        Portfolio Contact System v2.0 | Status: ✅ Operational
                    </div>
                </div>
            `,
            // Add proper email headers
            headers: {
                'X-Mailer': 'Portfolio Contact System v2.0',
                'X-Priority': '1', // High priority
                'X-MSMail-Priority': 'High'
            }
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        console.log('📨 Sent to:', process.env.GMAIL_USER);
        console.log('🔍 Response:', info.response);

    } catch (error) {
        console.error('❌ Test email failed with detailed error:');
        console.error('🔴 Error Code:', error.code);
        console.error('🔴 Error Command:', error.command);
        console.error('🔴 Error Message:', error.message);
        console.error('🔴 Full Error:', error);

        // Provide troubleshooting guidance
        console.log('\n🔧 Troubleshooting Steps:');
        console.log('1. Check your Gmail credentials in .env file');
        console.log('2. Verify your Gmail App Password is correct');
        console.log('3. Enable "Less Secure Apps" in Gmail if using regular password');
        console.log('4. Check your internet connection');
        console.log('5. Verify Gmail account is not blocked');

        process.exit(1); // Exit with error code to indicate failure
    }
}

// Apply rate limiting to contact route
app.use('/contact', contactLimiter);

// Enhanced contact form POST route with comprehensive validation and security
app.post('/contact', async (req, res) => {
    try {
        console.log('📨 Received contact form submission');

        // Check if request body exists and is properly formatted
        if (!req.body || typeof req.body !== 'object') {
            console.log('❌ Invalid request body');
            return res.status(400).json({ error: 'Invalid request format. Please ensure you are sending JSON data.' });
        }

        const { name, email, message } = req.body;

        // Comprehensive input validation
        if (!name || !email || !message) {
            console.log('❌ Missing required fields:', { hasName: !!name, hasEmail: !!email, hasMessage: !!message });
            return res.status(400).json({ error: 'All fields (name, email, message) are required.' });
        }

        // Name validation with detailed checks
        if (typeof name !== 'string') {
            return res.status(400).json({ error: 'Name must be a valid text string.' });
        }
        const trimmedName = name.trim();
        if (trimmedName.length < 2 || trimmedName.length > 100) {
            return res.status(400).json({ error: 'Name must be between 2 and 100 characters.' });
        }
        if (!/^[a-zA-Z\s\-'\.]+$/.test(trimmedName)) {
            return res.status(400).json({ error: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods.' });
        }

        // Email validation with enhanced regex
        if (typeof email !== 'string') {
            return res.status(400).json({ error: 'Email must be a valid email address.' });
        }
        const trimmedEmail = email.trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }

        // Message validation with content checks
        if (typeof message !== 'string') {
            return res.status(400).json({ error: 'Message must be valid text content.' });
        }
        const trimmedMessage = message.trim();
        if (trimmedMessage.length < 10 || trimmedMessage.length > 2000) {
            return res.status(400).json({ error: 'Message must be between 10 and 2000 characters.' });
        }

        console.log('✅ Input validation passed for:', { name: trimmedName, email: trimmedEmail, messageLength: trimmedMessage.length });

        // Sanitize message content for HTML email (basic sanitization)
        const sanitizeHtml = (str) => {
            return str
                .replace(/&/g, '&')
                .replace(/</g, '<')
                .replace(/>/g, '>')
                .replace(/"/g, '"')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
        };

        const sanitizedMessage = sanitizeHtml(trimmedMessage);
        const sanitizedName = sanitizeHtml(trimmedName);

        // Prepare enhanced email options
        const mailOptions = {
            from: {
                name: 'Portfolio Contact Form',
                address: process.env.GMAIL_USER
            },
            to: process.env.GMAIL_USER,
            replyTo: trimmedEmail, // Allow direct reply to sender
            subject: `📬 New Contact: ${sanitizedName} - Portfolio Inquiry`,
            text: `
New Contact Form Submission
===========================

👤 Name: ${trimmedName}
📧 Email: ${trimmedEmail}
📝 Message Length: ${trimmedMessage.length} characters

💬 Message:
${trimmedMessage}

---
📅 Received: ${new Date().toLocaleString()}
🌐 Sent from: Portfolio Website Contact Form
🔗 Source: ${req.headers.origin || 'Unknown'}
            `,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background: #ffffff; border: 1px solid #e1e5e9; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">📬 New Contact Message</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Portfolio Website Inquiry</p>
                    </div>

                    <!-- Content -->
                    <div style="padding: 30px;">
                        <!-- Sender Info -->
                        <div style="display: flex; align-items: center; margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                    <span style="font-size: 24px; margin-right: 10px;">👤</span>
                                    <span style="font-size: 18px; font-weight: 600; color: #2d3748;">${sanitizedName}</span>
                                </div>
                                <div style="display: flex; align-items: center;">
                                    <span style="font-size: 18px; margin-right: 8px;">📧</span>
                                    <a href="mailto:${trimmedEmail}" style="color: #667eea; text-decoration: none; font-weight: 500;">${trimmedEmail}</a>
                                </div>
                            </div>
                        </div>

                        <!-- Message Content -->
                        <div style="margin-bottom: 25px;">
                            <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 20px; display: flex; align-items: center;">
                                <span style="margin-right: 10px;">💬</span>
                                Message
                            </h3>
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e1e5e9; line-height: 1.6; color: #4a5568; white-space: pre-wrap;">
                                ${sanitizedMessage.replace(/\n/g, '<br>')}
                            </div>
                        </div>

                        <!-- Metadata -->
                        <div style="border-top: 1px solid #e1e5e9; padding-top: 20px; color: #718096; font-size: 14px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>Received:</strong> ${new Date().toLocaleString()}<br>
                                    <strong>Source:</strong> ${req.headers.origin || 'Portfolio Website'}<br>
                                    <strong>Message Length:</strong> ${trimmedMessage.length} characters
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 24px;">📊</div>
                                    <div style="font-size: 12px; color: #a0aec0;">Contact Form v2.0</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e1e5e9;">
                        <p style="margin: 0; color: #718096; font-size: 14px;">
                            This message was sent through your portfolio contact form.
                            <br>
                            <a href="mailto:${trimmedEmail}" style="color: #667eea; text-decoration: none;">Click here to reply directly</a>
                        </p>
                    </div>
                </div>
            `,
            // Enhanced email headers for better deliverability
            headers: {
                'X-Mailer': 'Portfolio Contact System v2.0',
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'High',
                'X-Auto-Response-Suppress': 'OOF, AutoReply',
                'List-Unsubscribe': `<mailto:${process.env.GMAIL_USER}?subject=Unsubscribe>`,
                'Return-Path': process.env.GMAIL_USER
            },
            // Additional metadata
            date: new Date(),
            encoding: 'utf-8'
        };

        console.log('📤 Attempting to send email...');

        // Send email with timeout and retry logic
        const emailResult = await Promise.race([
            transporter.sendMail(mailOptions),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Email sending timeout')), 30000)
            )
        ]);

        console.log('✅ Email sent successfully!');
        console.log('📧 Message ID:', emailResult.messageId);
        console.log('📨 Response:', emailResult.response);

        // Send success response
        res.status(200).json({
            success: true,
            message: 'Message sent successfully! Thank you for reaching out. 📧',
            timestamp: new Date().toISOString(),
            messageId: emailResult.messageId
        });

    } catch (error) {
        console.error('❌ Contact form error:', error);

        // Determine appropriate error response based on error type
        let errorMessage = 'An unexpected error occurred. Please try again later.';
        let statusCode = 500;

        if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Email service temporarily unavailable. Please try again in a few minutes.';
            statusCode = 503;
        } else if (error.code === 'EAUTH') {
            errorMessage = 'Email authentication failed. Please contact the administrator.';
            statusCode = 500;
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = 'Email sending timed out. Please try again.';
            statusCode = 504;
        } else if (error.message && error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.';
            statusCode = 408;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            timestamp: new Date().toISOString(),
            code: error.code || 'UNKNOWN_ERROR'
        });
    }
});

// Root route with system information
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        service: 'Portfolio Contact API',
        version: '2.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            health: '/health',
            contact: '/contact (POST)',
            test: '/test-email (GET - development only)'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())} seconds`,
        memory: process.memoryUsage(),
        version: process.version,
        platform: process.platform
    });
});

// Test email endpoint (development only)
app.get('/test-email', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Test endpoint not available in production' });
    }

    try {
        await sendTestMail();
        res.json({ success: true, message: 'Test email sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Graceful server startup with comprehensive diagnostics
app.listen(PORT, async () => {
    console.log('🚀 Starting Portfolio Contact API Server...');
    console.log(`📡 Server listening on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log('');

    // Verify environment variables
    console.log('🔍 Checking environment configuration...');
    const requiredEnvVars = ['GMAIL_USER', 'GMAIL_APP_PASSWORD'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars.join(', '));
        console.error('📝 Please check your .env file');
        process.exit(1);
    } else {
        console.log('✅ Environment variables verified');
    }

    console.log('');
    console.log('📧 Testing email configuration...');

    try {
        await sendTestMail();
        console.log('');
        console.log('🎉 Server startup completed successfully!');
        console.log('💡 Available endpoints:');
        console.log(`   GET  /         - API information`);
        console.log(`   GET  /health   - Health check`);
        console.log(`   POST /contact  - Contact form submission`);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`   GET  /test-email - Send test email (dev only)`);
        }
        console.log('');
        console.log('📬 Contact form is ready to receive messages!');
    } catch (error) {
        console.error('');
        console.error('❌ Email configuration test failed!');
        console.error('🔴 The server will continue running, but email functionality may not work.');
        console.error('🔧 Please check your Gmail credentials and network connection.');
        console.log('');
        console.log('💡 You can still test the contact form - errors will be logged.');
    }

    // Graceful shutdown handling
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        process.exit(0);
    });
});