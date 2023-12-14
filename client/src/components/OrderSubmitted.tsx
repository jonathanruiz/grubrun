import { useLocation } from "react-router-dom";
import config from "../../config";

const CLIENT_BASE_URL = config.client.baseUrl;

const OrderSubmitted = () => {
  const location = useLocation();
  const { orderId, name, email, max, time } = location.state;

  return (
    <div>
      <h2 className="text-2xl font-bold">Order Submitted</h2>
      <h3 className="text-gray-500 text-md uppercase font-bold tracking-wider">
        Thank you for your order!
      </h3>

      <div className="my-4">
        <div className="bg-blue-500 text-white text-center py-1">
          <p className="my-2">Here is the link to your order run page: </p>
        </div>
        <div className="border-blue-500 border-2 p-4 flex justify-center items-center rounded-b-lg">
          <p>
            <a
              href={`${CLIENT_BASE_URL}/order/${orderId}`}
              className="text-blue-500 underline"
            >{`${CLIENT_BASE_URL}/order/${orderId}`}</a>
          </p>
        </div>
      </div>

      <p className="my-2">
        Please share this link with your friends so they can add their orders.
      </p>

      <h3 className="text-gray-500 text-md uppercase font-bold tracking-wider">
        Order Details
      </h3>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
        <ul className="text-gray-700 text-sm">
          <li className="border-b-2 border-gray-200 py-2 flex justify-between items-center">
            <span className="text-gray-500 uppercase font-bold tracking-wider">
              Name:
            </span>{" "}
            <span>{name}</span>
          </li>
          <li className="border-b-2 border-gray-200 py-2 flex justify-between items-center">
            <span className="text-gray-500 uppercase font-bold tracking-wider">
              Email:
            </span>{" "}
            <span>{email}</span>
          </li>
          <li className="border-b-2 border-gray-200 py-2 flex justify-between items-center">
            <span className="text-gray-500 uppercase font-bold tracking-wider">
              Maximum Order Size:
            </span>{" "}
            <span>{max}</span>
          </li>
          <li className="border-b-2 border-gray-200 py-2 flex justify-between items-center">
            <span className="text-gray-500 uppercase font-bold tracking-wider">
              Time until leaving:
            </span>{" "}
            <span>{time}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OrderSubmitted;
