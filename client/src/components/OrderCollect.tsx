import { useEffect, useState } from "react";

interface Order {
  name: string;
  order: string;
}

const OrderCollect = () => {
  const [ws, setWS] = useState<WebSocket | null>(null);
  const [order, setOrder] = useState<Order[]>([]);

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8000/ws");

    websocket.onopen = () => {
      console.log("WebSocket connection opened");
    };

    websocket.onmessage = (message) => {
      console.log("Received message:", message.data);
      const data = JSON.parse(message.data);
      setOrder((orders) => [...orders, data]);
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
    if (ws) {
      ws.send(JSON.stringify(Object.fromEntries(data)));
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
          {order &&
            order.map((order: Order) => (
              <tr key={order.name}>
                <td className="w-1/2">{order.name}</td>
                <td className="w-1/2">{order.order}</td>
              </tr>
            ))}
        </tbody>
      </table>

      {order && <pre>{JSON.stringify(order, null, 2)}</pre>}
    </>
  );
};

export default OrderCollect;
