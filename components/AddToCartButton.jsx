"use client";

import { useState } from "react";
import { addToCartItem } from "../lib/cart";

export default function AddToCartButton({ product, className = "amazonPrimaryBtn" }) {
  const [label, setLabel] = useState("أضف إلى السلة");

  const onClick = () => {
    addToCartItem(product, 1);
    setLabel("تمت الإضافة");
    window.dispatchEvent(new Event("sudanzon-cart-updated"));
    window.setTimeout(() => setLabel("أضف إلى السلة"), 1500);
  };

  return (
    <button className={className} type="button" onClick={onClick}>
      {label}
    </button>
  );
}

