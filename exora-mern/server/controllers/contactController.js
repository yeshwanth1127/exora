const ContactInquiry = require('../models/ContactInquiry');

const submitContact = async (req, res) => {
  try {
    const { name, email, company, phone, message, source } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required',
      });
    }

    if (String(name).trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your full name',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (String(message).trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please share a bit more detail in your message',
      });
    }

    const inquiry = await ContactInquiry.create({
      name,
      email,
      company,
      phone,
      message,
      source,
    });

    console.log(`✅ Contact inquiry from ${inquiry.name} (${inquiry.email})`);

    return res.status(201).json({
      success: true,
      message: 'Thanks — we received your message and will get back to you soon.',
      data: {
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        createdAt: inquiry.created_at,
      },
    });
  } catch (error) {
    console.error('❌ Error saving contact inquiry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.',
    });
  }
};

module.exports = { submitContact };
