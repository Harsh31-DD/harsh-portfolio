require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Contact form POST route
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Validate inputs
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    try {
        // Mail options
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: 'harshdoyal31@gmail.com',
            subject: 'New Contact Form Submission',
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        };

        // Send email
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully! Thank you for your message.' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email. Please try again later.' });
    }
});

// Basic route
app.get('/', (req, res) => {
    res.send('Contact API is running.');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});