const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = 3000;

// Enable CORS for your Chrome extension
app.use(cors());
app.use(express.static('public'));

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Upload & Send Email Endpoint
app.post('/send-email', upload.single('file'), (req, res) => {
  if (!req.file || !req.body.email) {
    return res.status(400).json({ message: 'Missing file or email' });
  }

  const recipientEmail = req.body.email;
  const id = uuidv4().slice(0, 8);
  const filename = `${id}.html`;
  const filePath = path.join(__dirname, 'public', filename);

  // Save the HTML file
  fs.writeFile(filePath, req.file.buffer, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to save file' });
    }

    const link = `${process.env.BASE_URL}/${filename}`;  // replace with your production domain later

    // Email setup
    const mailOptions = {
      from: 'YOUR_EMAIL@gmail.com',
      to: recipientEmail,
      subject: 'Your SnapShare Link!',
      html: `<p>Hi there!</p><p>Here is your captured page:</p><p><a href="${link}">${link}</a></p>`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${recipientEmail}`);
      res.json({ message: 'Email sent successfully!', link });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send email' });
    }
  });
});

app.get('/'), (req, res) => {
    console.log('oh wow!')
}
// Start server
app.listen(port, () => {
  console.log(`SnapShare backend running at http://localhost:${port}`);
});
