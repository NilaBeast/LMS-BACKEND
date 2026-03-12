const axios = require("axios");

const BASE_URL = process.env.CASHFREE_BASE_URL;

exports.createOrder = async ({
  orderId,
  orderAmount,
  customerId,
  customerEmail,
  customerPhone,
}) => {

  const response = await axios.post(
    `${BASE_URL}/orders`,
    {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: "INR",

      customer_details: {
        customer_id: customerId,
        customer_email: customerEmail,
        customer_phone: customerPhone || "9999999999",
      },

      order_meta: {
        return_url: `http://localhost:5173/payment-success?order_id=${orderId}`,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01",
      },
    }
  );

  return response.data;
};