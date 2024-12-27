// Required modules
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/JobApplay", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a schema and model for companies
const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, required: true },
    isApplied: { type: Boolean, default: false },
});

const Company = mongoose.model('Company', companySchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the public directory

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    auth: {
        user: "gorasiyadhruv021@gmail.com",
        pass: "iern xqiy lnoy qicz",
    },
});

// POST endpoint to add multiple companies and send emails
app.post('/add-company', async (req, res) => {
    const companies = Array.isArray(req.body.name) ? req.body.name : [req.body.name];
    const emails = Array.isArray(req.body.email) ? req.body.email : [req.body.email];
    const categories = Array.isArray(req.body.category) ? req.body.category : [req.body.category];

    try {
        const emailPromises = companies.map((company, i) => {
            const mailOptions = {
                from: "gorasiyadhruv021@gmail.com",
                to: emails[i],
                subject: `Application for ${categories[i]} Developer Position`,
                text: `Dear Sir,

    I am excited to apply for the ${categories[i]} Developer position at ${company}. With 2 years of experience in Angular, TypeScript, and front-end development, I am confident in my ability to contribute to your team.

    At Shree Swaminarayan Gurukul international organization developed and maintained complex web applications, implemented RESTful APIs, and collaborated with cross-functional teams to deliver high-quality software solutions. My expertise includes Angular, RxJS, NgRx, Problem solving and debugging.

    Please find my resume attached. I look forward to discussing how my background and skills can benefit ${company}.

    Best regards,

    Dhruv Gorasiya
    70469 34474
    https://www.linkedin.com/in/dhruv-gorasiya`,
                attachments: [
                    {
                        path: './public/Dhruv Gorasiya.pdf',
                    },
                ],
            };

            return transporter.sendMail(mailOptions);
        });

        // Save companies to the database
        const companyDocuments = companies.map((name, i) => ({
            name,
            email: emails[i],
            category: categories[i],
            isApplied: false,
        }));

        await Company.insertMany(companyDocuments);

        // Send all emails concurrently
        await Promise.all(emailPromises);

        res.status(200).send('Companies added, emails sent, and data stored in MongoDB!');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to process request.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
