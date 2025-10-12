const Waitlist = require('../models/Waitlist');

/**
 * Add user to waitlist
 */
const joinWaitlist = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, countryCode } = req.body;

    // Validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if email already exists
    const exists = await Waitlist.emailExists(email);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'You are already on the waitlist!'
      });
    }

    // Create waitlist entry
    const waitlistEntry = await Waitlist.create({
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      country_code: countryCode || '+1'
    });

    console.log(`✅ New waitlist signup: ${firstName} ${lastName} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Successfully joined the waitlist!',
      data: {
        id: waitlistEntry.id,
        firstName: waitlistEntry.first_name,
        lastName: waitlistEntry.last_name,
        email: waitlistEntry.email
      }
    });

  } catch (error) {
    console.error('❌ Error joining waitlist:', error);
    
    if (error.message === 'Email already registered in waitlist') {
      return res.status(409).json({
        success: false,
        message: 'You are already on the waitlist!'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to join waitlist. Please try again.'
    });
  }
};

/**
 * Get waitlist count (public endpoint)
 */
const getWaitlistCount = async (req, res) => {
  try {
    const count = await Waitlist.getCount();
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('❌ Error getting waitlist count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get waitlist count'
    });
  }
};

/**
 * Get all waitlist entries (admin only - add auth middleware later)
 */
const getAllWaitlistEntries = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const entries = await Waitlist.getAll(limit, offset);
    const count = await Waitlist.getCount();
    
    res.json({
      success: true,
      data: entries,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + entries.length < count
      }
    });
  } catch (error) {
    console.error('❌ Error getting waitlist entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get waitlist entries'
    });
  }
};

module.exports = {
  joinWaitlist,
  getWaitlistCount,
  getAllWaitlistEntries
};

