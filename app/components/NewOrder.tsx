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
    <form onSubmit={handleSubmit(createOrder)} className="">
      <input
        {...(register("name"), { required: true })}
        placeholder="Full Name"
      ></input>
      <input
        {...(register("email"), { required: true })}
        placeholder="Email"
      ></input>
      <input
        {...register("maxOrderSize")}
        placeholder="Max # of Orders"
      ></input>
      <input
        {...register("leaving")}
        placeholder="What time are you leaving?"
      ></input>
      <button type="submit">Submit</button>
    </form>
  );
};

export default NewOrder;
