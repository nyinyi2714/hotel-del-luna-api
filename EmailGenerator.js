const EmailGenerator = (name, reservationId, checkInDate, checkOutDate, roomType, numOfGuests, price) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const formatDate = (dateObj) => {
    return `${dateObj.day} ${months[dateObj.month - 1]}, ${dateObj.year}`;
  };

  return (
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hotel Del Luna - Reservation Completed</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #ffffff;
          margin: 0;
          padding: 0;
        }
    
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    
        .header {
          background-color: #0f044c;
          color: #ffffff;
          padding: 15px;
          text-align: center;
        }

        h1 {
          margin: 0;
        }
        
        .content {
          padding: 20px;
          color: #525252;
          border: 1px solid #dddddd;
        }

        img {
          max-width: 150px;
        }
    
        .confirmation-text {
          font-size: 18px;
          margin-bottom: 20px;
        }
    
        .reservation-details {
          text-align: left;
          margin-bottom: 20px;
        }
    
        .reservation-details p {
          margin: 5px 0;
        }
    
        .footer {
          background-color: #0f044c;
          color: #ffffff;
          padding: 10px;
          text-align: center;
        }

        a {
          color: #fff;
        }

      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Hotel Del Luna</h1>
        </div>
        <div class="content">
          <p class="confirmation-text">Dear ${name},</p>
          <p>Your reservation at Hotel Del Luna has been successfully completed. We are excited to welcome you!</p>
    
          <div class="reservation-details">
            <p><strong>Reservation Details:</strong></p>
            <p>Reservation ID: ${reservationId}</p>
            <p>Total Cost: $${price}</p>
            <p>Check-in Date: ${formatDate(checkInDate)}</p>
            <p>Check-out Date: ${formatDate(checkOutDate)}</p>
            <p>Room Type: ${roomType}</p>
            <p>Number of Guests: ${numOfGuests}</p>
          </div>
    
          <p>We hope you have a pleasant stay at Hotel Del Luna. If you have any questions or need assistance, feel free to contact our staff.</p>
    
          <p>Thank you for choosing Hotel Del Luna. We look forward to serving you!</p>
          <img src="https://main.d3h5714ovsmoy5.amplifyapp.com/images/logo.png" alt="">
        </div>
        <div class="footer">
          <p>Hotel Del Luna | 123 Reseda Street | 818-555-5555 | <a>hotel.del.luna@gmail.com</a></p>
        </div>
      </div>
    </body>
    </html>
    `
  );
}

module.exports = EmailGenerator;