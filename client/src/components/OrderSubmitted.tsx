import { useLocation } from "react-router-dom";
import config from "../../config";

const BASE_URL = config.api.baseUrl;

const OrderSubmitted = () => {
  const location = useLocation();
  const { orderId } = location.state;

  return (
    <div>
      <h2>Order Submitted</h2>
      <p>Thank you for your order!</p>
      <p>Here is the link to your order run page: </p>
      <p>{`${BASE_URL}/order/${orderId}`}</p>
    </div>
  );
};

export default OrderSubmitted;
