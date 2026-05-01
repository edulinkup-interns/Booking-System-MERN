const User = require('../models/User');
const Waitlist = require('../models/Waitlist');
const logger = require('./logger');

const cleanupExpiredTokens = async () => {
  try {
    // Remove expired password reset tokens
    const result = await User.updateMany(
      { passwordResetExpires: { $lt: new Date() } },
      { $unset: { passwordResetToken: 1, passwordResetExpires: 1 } }
    );

    // Remove expired waitlist entries
    const waitlistResult = await Waitlist.updateMany(
      { expiresAt: { $lt: new Date() }, status: 'waiting' },
      { $set: { status: 'expired' } }
    );

    logger.info(`Cleanup: cleared ${result.modifiedCount} expired tokens, ${waitlistResult.modifiedCount} waitlist entries`);
  } catch (error) {
    logger.error(`Cleanup error: ${error.message}`);
  }
};

module.exports = { cleanupExpiredTokens };
