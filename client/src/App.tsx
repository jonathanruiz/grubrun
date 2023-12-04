import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OrderForm from "./components/OrderForm";

function App() {
  return (
    <Router>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-left">
          <h1 className="text-3xl font-bold underline">Grub Run</h1>
          <Routes>
            <Route path="/" element={<OrderForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
