import { useState, useEffect } from "react";

const OrderForm = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Create a WebSocket connection to the server
    const websocket = new WebSocket("ws://localhost:8000/ws");

    // Listen for messages from the server
    websocket.onopen = () => {
      console.log("WebSocket connection opened");
    };

    websocket.onmessage = (event) => {
      console.log(`Received: ${event.data}`);
    };

    websocket.onerror = (error) => {
      console.log(`WebSocket error: ${error}`);
    };

    websocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (ws) {
      ws.send(JSON.stringify(Object.fromEntries(data)));
    }
  };

  return (
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
      <label htmlFor="name">Name</label>
      <input
        className="border p-2"
        name="name"
        type="text"
        placeholder="Enter your name here"
      />
      <label htmlFor="email">Email</label>
      <input
        className="border p-2"
        name="email"
        type="text"
        placeholder="Enter your email here"
      />
      <label htmlFor="max">Maximum Order Size</label>
      <input
        className="border p-2"
        name="max"
        type="text"
        placeholder="Enter maximum order size"
      />
      <label htmlFor="time">Time until leaving (in minutes)</label>
      <input
        className="border p-2"
        name="time"
        type="text"
        placeholder="Enter minutes until leaving"
      />
      <button
        className="bg-blue-500 text-white self-start py-2 px-4 rounded"
        type="submit"
      >
        Submit
      </button>
    </form>
  );
};

export default OrderForm;
