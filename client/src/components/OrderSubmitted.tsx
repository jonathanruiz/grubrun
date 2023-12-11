import { useLocation } from "react-router-dom";
import config from "../../config";

const CLIENT_BASE_URL = config.client.baseUrl;

const OrderSubmitted = () => {
  const location = useLocation();
  const { orderId, name, email, max, time } = location.state;

  return (
    <div>
      <h2>Order Submitted</h2>
      <p>Thank you for your order!</p>
      <p>Here is the link to your order run page: </p>
      <p>{`${CLIENT_BASE_URL}/order/${orderId}`}</p>

      <p>
        Please share this link with your friends so they can add their orders.
      </p>
      <br />

      <p>Order Details</p>
      <ul>
        <li>Name: {name}</li>
        <li>Email: {email}</li>
        <li>Maximum Order Size: {max}</li>
        <li>Time until leaving: {time}</li>
      </ul>
    </div>
  );
};

export default OrderSubmitted;
