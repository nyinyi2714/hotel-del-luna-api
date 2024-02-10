const { Schema, model } = require('mongoose');

const dateSchema = new Schema({
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  day: {
    type: Number,
    required: true,
  },
});

const reservationSchema = new Schema({
  checkinDate: {
    type: dateSchema,
    required: true,
  },
  checkoutDate: {
    type: dateSchema,
    required: true,
  },
  numOfGuests: {
    type: Number,
    required: true,
  },
  roomType: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

module.exports = model('Reservation', reservationSchema);
