import { useEffect, useState } from "react";

const OrderCollect = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);

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
      setWs(data);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (ws) {
      ws.send(JSON.stringify(Object.fromEntries(data)));
    }
  };
  return (
    <>
      <h2>Order Collect</h2>
      {ws && <pre>{JSON.stringify(ws, null, 2)}</pre>}
    </>
  );
};

export default OrderCollect;
