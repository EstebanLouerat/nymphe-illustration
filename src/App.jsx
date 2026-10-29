import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useStore } from "./services/store";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import Footer from "./components/Footer";
import ToastStack from "./components/ToastStack";
import PageTransition from "./components/PageTransition";
import Home from "./pages/Home";
import Product from "./pages/Product";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Portfolio from "./pages/Portfolio";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import NotFound from "./pages/NotFound";
import Account from "./pages/Account";
import PreviewIllustration from "./pages/PreviewIllustration";

function App() {
  useAuth();

  const loadStock = useStore((s) => s.loadStock);
  useEffect(() => {
    loadStock();
  }, [loadStock]);

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Cart />
        <ToastStack />

        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/portfolio" element={<Portfolio />} />
            {/* Ancienne page Commission : les liens existants mènent au portfolio */}
            <Route path="/commission" element={<Navigate to="/portfolio" replace />} />
            <Route path="/account" element={<Account />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
