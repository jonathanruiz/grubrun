import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OrderRunForm from "./components/OrderRunForm";
import OrderRunSubmitted from "./components/OrderRunSubmitted";
import OrderCollect from "./components/OrderCollect";

function App() {
  return (
    <Router>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-left">
          <h1 className="text-3xl font-bold underline">Grub Run</h1>
          <Routes>
            <Route path="/" element={<OrderRunForm />} />
            <Route
              path="/orderSubmitted/:orderId"
              element={<OrderRunSubmitted />}
            />
            <Route path="/order/:orderId" element={<OrderCollect />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
