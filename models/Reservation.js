const { Schema, model } = require('mongoose')

const reservationSchema = new Schema({ 
    bookedDate: {
        type: String,
        required: true,
    },
    checkinDate: {
        type: String,
        required: true,
    },
    checkoutDate: {
        type: String,
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
    }
})

module.exports = model('Reservation', reservationSchema);
