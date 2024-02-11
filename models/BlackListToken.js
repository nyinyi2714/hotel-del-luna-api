const { Schema, model } = require('mongoose');

const BlacklistTokenSchema = new Schema ({
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  blacklistedAt: {
    type: Date, 
    default: Date.now 
  },
});

// Add the expires property for TTL to clean up blacklist tokens
const YOUR_TTL_IN_SECONDS = 24 * 60 * 60; // 24 hrs
BlacklistTokenSchema.index({ blacklistedAt: 1 }, { expireAfterSeconds: YOUR_TTL_IN_SECONDS });

module.exports = model('BlackListToken', BlacklistTokenSchema);
