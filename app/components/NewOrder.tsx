"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodType } from "zod";

const schema: ZodType = z.object({
  name: z
    .string()
    .min(2, { message: "Name must contain at least 2 character(s)" }),
  email: z.string().email(),
  maxOrderSize: z.string().min(1).max(100),
  departureTime: z.string().min(1).max(60),
});

const NewOrder = () => {
  const createOrder = () => {
    console.log("order created");
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      maxOrderSize: "",
      departureTime: "",
    },
    resolver: zodResolver(schema),
  });

  return (
    <form
      className="w-1/3"
      autoComplete="off"
      onSubmit={handleSubmit(createOrder)}
    >
      <div className="mb-5">
        <label htmlFor="name">Name</label>
        <input
          className="w-full block h-10 bg-neutral-900"
          placeholder="Full Name"
          {...register("name")}
        ></input>
        <p className="text-red-700">{errors.name?.message}</p>
      </div>
      <div className="mb-5">
        <label htmlFor="email">Email</label>
        <input
          className="w-full block h-10 bg-neutral-900"
          type="email"
          placeholder="Email"
          {...register("email")}
        ></input>
        <p className="text-red-700">{errors.email?.message}</p>
      </div>
      <div className="mb-5">
        <label htmlFor="maxOrderSize">Max Order Size</label>
        <input
          className="w-full block h-10 bg-neutral-900"
          placeholder="Max # of Orders"
          {...register("maxOrderSize")}
        ></input>
        <p className="text-red-700">{errors.maxOrderSize?.message}</p>
      </div>
      <div className="mb-5">
        <label htmlFor="departureTime">Departure Time</label>
        <input
          className="w-full block h-10 bg-neutral-900"
          placeholder="What time are you leaving?"
          {...register("departureTime")}
        ></input>
        <p className="text-red-700">{errors.departureTime?.message}</p>
      </div>
      <button type="submit" className="bg-blue-800 p-4 rounded">
        Submit
      </button>
    </form>
  );
};

export default NewOrder;
