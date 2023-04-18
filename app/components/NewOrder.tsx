"use client";

import { useForm } from "react-hook-form";

const NewOrder = () => {
  const createOrder = () => {
    console.log("order created");
  };

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(createOrder)} className="w-1/3">
      <div className="mb-5">
        <label htmlFor="name">Name</label>
        <input
          {...(register("name"), { required: true })}
          placeholder="Full Name"
          className="w-full block h-10 bg-neutral-900"
        ></input>
      </div>
      <div className="mb-5">
        <label htmlFor="email">Email</label>
        <input
          {...(register("email"), { required: true })}
          placeholder="Email"
          className="w-full block h-10 bg-neutral-900"
        ></input>
      </div>
      <div className="mb-5">
        <label htmlFor="maxOrderSize">Max Order Size</label>
        <input
          {...register("maxOrderSize")}
          placeholder="Max # of Orders"
          className="w-full block h-10 bg-neutral-900"
        ></input>
      </div>
      <div className="mb-5">
        <label htmlFor="departureTime">Departure Time</label>
        <input
          {...register("departureTime")}
          placeholder="What time are you leaving?"
          className="w-full block h-10 bg-neutral-900"
        ></input>
      </div>
      <button type="submit" className="bg-blue-800 p-4 rounded">
        Submit
      </button>
    </form>
  );
};

export default NewOrder;
