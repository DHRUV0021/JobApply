const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the public directory

// Create nodemailer transporter once
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "Your Email Address",
        pass: "password",
    },
});

// POST endpoint to add multiple companies and send emails
app.post('/add-company', async (req, res) => {
    const companies = Array.isArray(req.body.name) ? req.body.name : [req.body.name];
    const emails = Array.isArray(req.body.email) ? req.body.email : [req.body.email];

    try {
        const emailPromises = companies.map((company, i) => {
            const mailOptions = {
                from: "Your Email Address",
                to: emails[i],
                subject: 'Company Added',
                text: `You have been added to the company list: ${company}`,
                attachments: [
                    {
                        path: "./public/pdf_Path",
                    },
                ],
            };

            return transporter.sendMail(mailOptions);
        });

        // Send all emails concurrently
        await Promise.all(emailPromises);

        res.status(200).send('Companies added and emails sent with attachment!');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send emails.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
