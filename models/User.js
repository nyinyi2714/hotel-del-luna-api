const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  reservations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Reservation',
    },

  ]
})

module.exports = model('User', userSchema);
