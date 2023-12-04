const OrderForm = () => {
  return (
    <form className="flex flex-col space-y-4">
      <label htmlFor="name">Name</label>
      <input className="border p-2" type="text" placeholder="Name" />
      <label htmlFor="time">Time until leaving (in minutes)</label>
      <input
        className="border p-2"
        type="text"
        placeholder="Time until leaving (in minutes)"
      />
      <label htmlFor="max">Maximum number of orders</label>
      <input
        className="border p-2"
        type="text"
        placeholder="Maximum number of orders"
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
