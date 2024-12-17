import React from "react";
import ReactDOM from "react-dom/client";
import ProductList from "./ProductList";
import "./style.css";

const root = ReactDOM.createRoot(document.getElementById("app")); // Cambia ReactDOM.render
root.render(
  <React.StrictMode>
    <ProductList />
  </React.StrictMode>
);
