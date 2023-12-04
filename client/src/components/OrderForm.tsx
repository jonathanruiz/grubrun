const OrderForm = () => {
  return (
    <form className="flex flex-col space-y-4">
      <label htmlFor="name">Name</label>
      <input
        className="border p-2"
        type="text"
        placeholder="Enter your name here"
      />
      <label htmlFor="email">Email</label>
      <input
        className="border p-2"
        type="text"
        placeholder="Enter your email here"
      />
      <label htmlFor="max">Maximum Order Size</label>
      <input
        className="border p-2"
        type="text"
        placeholder="Enter maximum order size"
      />
      <label htmlFor="time">Time until leaving (in minutes)</label>
      <input
        className="border p-2"
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
