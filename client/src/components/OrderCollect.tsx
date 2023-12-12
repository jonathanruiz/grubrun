import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import config from "../../config";

const API_BASE_URL = config.api.baseUrl;

interface OrderRun {
  orderId: string;
  name: string;
  email: string;
  max: string;
  time: string;
  orders: Order[];
}
interface Order {
  name: string;
  order: string;
}

const OrderCollect = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [ws, setWS] = useState<WebSocket | null>(null);
  const [orderRun, setOrderRun] = useState<OrderRun | null>(null);

  console.log("Here is the order: ", orderRun);

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8000/ws");

    websocket.onopen = () => {
      console.log("WebSocket connection opened");
      fetch(`${API_BASE_URL}/api/getOrderRun?orderId=${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          console.log("Server response:", res);
          return res.json();
        })
        .catch((err) => {
          console.error("Error was thrown:", err);
        })
        .then((data) => {
          if (orderId) {
            setOrderRun(data);
            console.log("Here is the data from GET: ", data);
          } else {
            console.error("orderId is undefined");
          }
        })
        .catch((err) => {
          console.error("Error was thrown:", err);
        });
    };

    websocket.onmessage = (message) => {
      console.log("Received message:", message.data);
      const data = JSON.parse(message.data);
      setOrderRun((orderRun) => ({ ...orderRun, ...data }));
    };

    websocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    websocket.onerror = (error) => {
      console.log("WebSocket error:", error);
    };

    setWS(websocket);

    return () => {
      console.log("Closing WebSocket connection");
      websocket.close();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitting order");
    const data = new FormData(e.currentTarget);
    const jsonData = Object.fromEntries(data.entries());

    // Add the orderId to the JSON data
    jsonData.orderId = orderId || "";

    if (ws) {
      ws.send(JSON.stringify(jsonData));
    }
  };
  return (
    <>
      <h2>Place your order here</h2>
      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          className="border p-2"
          name="name"
          type="text"
          placeholder="Enter your name here"
        />
        <label htmlFor="order">Order</label>
        <input
          className="border p-2"
          name="order"
          type="text"
          placeholder="Enter your order here"
        />
        <button
          className="bg-blue-500 text-white self-start py-2 px-4 rounded"
          type="submit"
        >
          Submit
        </button>
      </form>

      <h2>Order</h2>
      <table>
        <thead>
          <tr className="text-left text-gray-500 text-sm uppercase font-medium tracking-wider">
            <th className="w-1/2">Name</th>
            <th className="w-1/2">Order</th>
          </tr>
        </thead>
        <tbody>
          {orderId &&
            orderRun &&
            orderRun[orderId] &&
            orderRun[orderId].orders &&
            orderRun[orderId].orders.map((order: Order) => (
              <tr key={order.name}>
                <td className="w-1/2">{order.name}</td>
                <td className="w-1/2">{order.order}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
};

export default OrderCollect;
