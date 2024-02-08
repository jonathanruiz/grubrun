import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderProps, OrderRunProps, OrderFormSchema } from "../models/schemas";
import config from "../../config";

const API_BASE_URL = config.api.baseUrl;

const OrderCollect = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [ws, setWS] = useState<WebSocket>();
  const [orderRun, setOrderRun] = useState<OrderRunProps>();
  const [maxReached, setMaxReached] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderProps>({
    resolver: zodResolver(OrderFormSchema),
  });

  fetch(`${API_BASE_URL}/api/getOrderRun?orderId=${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((data: OrderProps) => {
      // @ts-expect-error - data is not null
      if (data[orderId].orders.length >= data[orderId].max) {
        setMaxReached(true);
      }
    })
    .catch((err) => {
      console.error("Error was thrown:", err);
    });

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
  }, [orderId]);

  const submitForm: SubmitHandler<OrderProps> = async (data: OrderProps) => {
    console.log("Submitting order");
    const jsonData = {
      ...data,
      orderId: orderId,
    };

    // Add the orderId to the JSON data
    jsonData.orderId = orderId || "";

    // Check if orderId is defined
    if (orderId !== undefined) {
      // @ts-expect-error - Get the current OrderRun
      const currentOrderRun = orderRun[orderId];

      // Check if the currentOrderRun and its orders property are defined
      if (
        currentOrderRun &&
        currentOrderRun.orders &&
        currentOrderRun.orders.length >= currentOrderRun.max
      ) {
        alert("Maximum number of orders reached for this run.");
        setMaxReached(true);
        return;
      }
    } else {
      alert("Order ID is not defined.");
      return;
    }

    if (ws) {
      ws.send(JSON.stringify(jsonData));
    }
  };

  // @ts-expect-error - orderRun is not null
  const [timeRemaining, setTimeRemaining] = useState(orderRun?.[orderId]?.time);
  console.log("Time remaining:", timeRemaining);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timerId = setInterval(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);

      return () => clearInterval(timerId); // cleanup on component unmount
    }
  }, [timeRemaining]);

  return (
    <>
      {maxReached ? (
        <h2 className="text-2xl font-bold">
          Maximum number of orders reached for this run.
        </h2>
      ) : (
        <>
          <h2 className="text-2xl font-bold">
            Place your order here for{" "}
            <span className="bg-blue-500 text-white p-2 rounded-lg">
              {/* @ts-expect-error - orderRun is not null */}
              {orderRun?.[orderId]?.location}
            </span>
          </h2>
          {/* Create a timer that counts down using the time property */}
          <h3 className="text-xl font-bold">Time remaining: {timeRemaining}</h3>
          <form
            className="flex flex-col space-y-4"
            onSubmit={handleSubmit(submitForm)}
          >
            <label htmlFor="name">Name</label>
            <input
              className="border p-2"
              type="text"
              placeholder="Enter your name here"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}

            <label htmlFor="order">Order</label>
            <input
              className="border p-2"
              type="text"
              placeholder="Enter your order here"
              {...register("order")}
            />
            {errors.order && (
              <p className="text-red-500">{errors.order.message}</p>
            )}

            <button
              className="bg-blue-500 text-white self-start py-2 px-4 rounded"
              type="submit"
            >
              Submit
            </button>
          </form>
        </>
      )}

      <div className="pt-6 pb-8 mb-4 flex flex-col my-2">
        <div className="flex justify-between text-gray-500 text-md uppercase font-bold tracking-wider">
          <h3 className="text-gray-500 text-md uppercase font-bold tracking-wider">
            Orders
          </h3>
          <p>
            {/* @ts-expect-error - orderRun is not null */}
            {orderRun?.[orderId]?.orders?.length ?? 0}/
            {/* @ts-expect-error - orderRun is not null */}
            {orderRun?.[orderId]?.max}
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm uppercase font-bold tracking-wider">
              <th className="w-1/2 py-2">Name</th>
              <th className="w-1/2 py-2">Order</th>
            </tr>
          </thead>
          <tbody>
            {
              // @ts-expect-error - orderRun is not null
              orderRun?.[orderId]?.orders?.map((order: Order) => (
                <tr
                  className="border-b-2 border-gray-200 py-2"
                  key={order.name}
                >
                  <td className="w-1/2 text-gray-700 text-sm py-2">
                    {order.name}
                  </td>
                  <td className="w-1/2 text-gray-700 text-sm py-2">
                    {order.order}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrderCollect;
