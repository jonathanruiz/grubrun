import OrderForm from "./components/OrderForm";

function App() {
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-left">
        <h1 className="text-3xl font-bold underline">Grub Run</h1>
        <OrderForm />
      </div>
    </div>
  );
}

export default App;
