import { useEffect, useState } from "react";

const OrderCollect = () => {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Create a WebSocket connection to the server
    const websocket = new WebSocket("ws://localhost:8000/ws");

    // Listen for messages from the server
    websocket.onopen = () => {
      console.log("WebSocket Client Connected");
    };

    websocket.onmessage = (message) => {
      console.log("Received:", message.data);
      // Assuming the server sends the order data as a JSON string
      const data = JSON.parse(message.data);
      setOrder(data);
    };

    websocket.onerror = (error) => {
      console.log(`WebSocket error: ${error}`);
    };

    websocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      websocket.close();
    };
  }, []);
  return (
    <>
      <h2>Order Collect</h2>
      {order && <pre>{JSON.stringify(order, null, 2)}</pre>}
    </>
  );
};

export default OrderCollect;
