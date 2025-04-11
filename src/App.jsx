import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import { Home } from "./components/Home";
import ContractForm from "./components/ContractForm";
import AboutUs from "./components/AboutUs";
import FrontPage from "./components/FrontPage";
import Product from "./components/Product";
// Import other components for different pages

function App() {
  return (
    <Router>
      <div className="w-full h-full p-5 bg-black shadow-md text-center text-gray-800">
        <Header />
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/product" element={<Product />} />
          {/* <Route path="/contact" element={<ContactPage />} /> */}
          {/* <Route path="/pricing" element={<PricingPage />} /> */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/ContractForm" element={<ContractForm />} caseSensitive />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
