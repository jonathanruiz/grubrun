import NewOrder from "./components/NewOrder";

const Home = () => {
  return (
    <main className="p-24">
      <h2 className="text-4xl">Create an order!</h2>
      <NewOrder />
    </main>
  );
};

export default Home;
