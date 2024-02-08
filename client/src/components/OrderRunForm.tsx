import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";

import config from "../../config";

const schema = zod.object({
  name: zod.string(),
  email: zod.string().email(),
  location: zod.string(),
  max: zod.number(),
  time: zod.number(),
});

const API_BASE_URL = config.api.baseUrl;

const OrderRunForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // @ts-expect-error - data is not null
  const submitForm = async (data) => {
    // Create a JavaScript object with the form data
    // const jsonData = Object.fromEntries(data.entries());

    console.log(data);
    // console.log(jsonData);

    const response = await fetch(`${API_BASE_URL}/api/createOrder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // Convert the JavaScript object to a JSON string
    })
      .then((res) => res.json())
      .catch((err) => {
        console.error("Error was thrown:", err);
      });

    navigate(`/orderSubmitted/${response.orderId}`, { state: response });
  };

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={handleSubmit(submitForm)}
    >
      <h2 className="text-2xl font-bold">Order Run Form</h2>
      <label
        className="text-gray-500 text-sm uppercase font-bold tracking-wider"
        htmlFor="name"
      >
        Name
      </label>
      <input
        className="border p-2"
        type="text"
        placeholder="Enter your name here"
        {...register("name")}
      />
      {/* @ts-expect-error - error */}
      {errors.name && <p className="text-red-500">{errors.name.message}</p>}

      <label
        className="text-gray-500 text-sm uppercase font-bold tracking-wider"
        htmlFor="email"
      >
        Email
      </label>
      <input
        className="border p-2"
        type="text"
        placeholder="Enter your email here"
        {...register("email")}
      />
      {/* @ts-expect-error - error */}
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <label
        className="text-gray-500 text-sm uppercase font-bold tracking-wider"
        htmlFor="locaiton"
      >
        Where are you going?
      </label>
      <input
        className="border p-2"
        type="text"
        placeholder="Enter location here"
        {...register("location")}
      />
      {errors.location && (
        // @ts-expect-error - error
        <p className="text-red-500">{errors.location.message}</p>
      )}

      <label
        className="text-gray-500 text-sm uppercase font-bold tracking-wider"
        htmlFor="max"
      >
        Maximum Order Size
      </label>
      <input
        className="border p-2"
        type="number"
        placeholder="Enter maximum order size"
        {...register("max", { valueAsNumber: true })}
      />
      {/* @ts-expect-error - error */}
      {errors.max && <p className="text-red-500">{errors.max.message}</p>}

      <label
        className="text-gray-500 text-sm uppercase font-bold tracking-wider"
        htmlFor="time"
      >
        Time until leaving (in minutes)
      </label>
      <input
        className="border p-2"
        type="number"
        placeholder="Enter minutes until leaving"
        {...register("time", { valueAsNumber: true })}
      />
      {/* @ts-expect-error - error */}
      {errors.time && <p className="text-red-500">{errors.time.message}</p>}

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