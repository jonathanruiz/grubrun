import { useNavigate } from "react-router-dom";
import config from "../../config";

const API_BASE_URL = config.api.baseUrl;

const OrderRunForm = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    // Create a JavaScript object with the form data
    const jsonData = Object.fromEntries(data.entries());

    // @ts-expect-error - Convert the time and max properties to numbers
    jsonData.time = Number(jsonData.time);
    // @ts-expect-error - Convert the time and max properties to numbers
    jsonData.max = Number(jsonData.max);

    const response = await fetch(`${API_BASE_URL}/api/createOrder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData), // Convert the JavaScript object to a JSON string
    })
      .then((res) => res.json())
      .catch((err) => {
        console.error("Error was thrown:", err);
      });

    navigate(`/orderSubmitted/${response.orderId}`, { state: response });
  };

  return (
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold">Order Run Form</h2>
      <label
        className="text-gray-500 text-sm uppercase font-bold tracking-wider"
        htmlFor="name"
      >
        Name
      </label>
      <input
        className="border p-2"
        name="name"
        type="text"
        placeholder="Enter your name here"
      />
      <label
        className="text-gray-500 text-sm uppercase font-bold tracking-wider"
        htmlFor="email"
      >
        Email
      </label>
      <input
        className="border p-2"
        name="email"
        type="text"
        placeholder="Enter your email here"
      />
      <label
        className="text-gray-500 text-sm uppercase font-bold tracking-wider"
        htmlFor="locaiton"
      >
        Where are you going?
      </label>
      <input
        className="border p-2"
        name="location"
        type="text"
        placeholder="Enter location here"
      />
      <label
        className="text-gray-500 text-sm uppercase font-bold tracking-wider"
        htmlFor="max"
      >
        Maximum Order Size
      </label>
      <input
        className="border p-2"
        name="max"
        type="number"
        placeholder="Enter maximum order size"
      />
      <label
        className="text-gray-500 text-sm uppercase font-bold tracking-wider"
        htmlFor="time"
      >
        Time until leaving (in minutes)
      </label>
      <input
        className="border p-2"
        name="time"
        type="number"
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

export default OrderRunForm;
