module.exports = ({
  orderId,
  paymentId,
  amount,
  taxAmount,
  totalAmount,
  seatNo,
  departureState,
  arrivalState,
  departureTime,
}) => {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Order Receipt</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
    }

    .receipt {
      border: 1px solid #ccc;
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }

    .header {
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
    }

    .order-details {
      margin-bottom: 20px;
    }

    .item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }

    .item span {
      font-weight: bold;
    }

    .total {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      font-weight: bold;
    }

    .signature {
      text-align: right;
      margin-top: 50px;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">Order Receipt</div>
    <div class="order-details">
      <div class="item">
        <span>Order Id:</span>
        <span>${orderId}</span>
      </div>
      <div class="item">
        <span>Payment Id:</span>
        <span>${paymentId}</span>
      </div>
      <div class="item">
        <span>Seat Number:</span>
        <span>${seatNo}</span>
      </div>
      <div class="item">
        <span>Departure State:</span>
        <span>${departureState}</span>
      </div>
      <div class="item">
        <span>Arrival State:</span>
        <span>${arrivalState}</span>
      </div>
      <div class="item">
        <span>Departure Time:</span>
        <span>${new Date(departureTime)
          .getUTCHours()
          .toString()
          .padStart(2, "0")}:${
    new Date(departureTime).getUTCMinutes().toString().padStart(2, "0") + " "
  } ${new Date(departureTime).getUTCMonth() + 1}/${new Date(
    departureTime
  ).getUTCDate()}/${new Date(departureTime).getUTCFullYear()}</span>
      </div>
      <div class="item">
        <span>Price:</span>
        <span>${amount}</span>
      </div>
      <div class="item">
        <span>Tax:</span>
        <span>${taxAmount}</span>
      </div>
      <div class="item">
        <span>Total:</span>
        <span>${totalAmount}</span>
      </div>
    <div class="signature">
      Signature: Transport
    </div>
  </div>
</body>
</html>
`;
};


