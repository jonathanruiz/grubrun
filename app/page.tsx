import NewOrder from "./components/NewOrder";

const Home = () => {
  return (
    <main className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl">Create an order!</h2>
      <NewOrder />
    </main>
  );
};

export default Home;
