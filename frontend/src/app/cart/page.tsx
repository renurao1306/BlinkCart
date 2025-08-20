"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { clearCart } from "@/redux/cartSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { addOrder } from "@/redux/orderSlice";

interface Product {
    sku: string;
    name: string;
    price: number;
}

export default function CartPage() {
    const items = useSelector((state: RootState) => state.cart.items);
    const dispatch = useDispatch();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [deliveryAddress, setDeliveryAddress] = useState("");

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("http://localhost:5000/api/customers/products");
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error("Failed to fetch products", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    if (loading) return <p>Loading cart...</p>;

    const detailedCart = items.map((item) => {
        const product = products.find((p) => p.sku === item.sku);
        return {
            ...item,
            name: product?.name ?? "Unknown",
            price: product?.price ?? 0,
        };
    });

    const total = detailedCart.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeliveryAddress(e.target.value);
    };

    const handlePlaceOrder = async () => {
        if (!deliveryAddress.trim()) {
            alert("Please enter delivery address before placing order");
            return;
        }

        const orderData = {
            items: detailedCart.map((item) => ({
                sku: item.sku,
                quantity: item.quantity,
            })),
            deliveryAddress,
            deliveryPartner: ""
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/customers/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });

            if (!res.ok) {
                throw new Error("Failed to place order");
            }

            const data = await res.json();
            dispatch(addOrder(data));
            alert(`Order placed successfully!\nOrder ID: ${data._id.slice(-6)}\nOrder Status: ${data.status}\nDelivery Address: ${deliveryAddress}\nTotal: ₹${total}`);

            dispatch(clearCart());
            router.push("/product-catalog");
        } catch (error) {
            console.error(error);
            alert("Something went wrong while placing the order.");
        }
    };


    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-6 relative">
                <Link
                    href="/product-catalog"
                    className="absolute left-0 p-2 rounded hover:bg-gray-200"
                >
                    <ArrowLeft size={24} />
                </Link>
                <h2 className="text-xl font-bold mx-auto">Your Cart</h2>
            </div>

            {detailedCart.length === 0 ? (
                <p className="text-gray-500">Your cart is empty</p>
            ) : (
                <div className="flex flex-col items-center space-y-4 justify-center">
                    {detailedCart.map((item) => (
                        <Card key={item.sku} className="shadow-md hover:shadow-lg transition-all w-100">
                            <CardHeader className="pt-2">
                                <CardTitle className="p-0 m-0">{item.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex justify-between">
                                    <p>SKU: {item.sku}</p>
                                    <p>Price: ₹{item.price}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Total: ₹{item.price * item.quantity}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {detailedCart.length > 0 && (
                <div className="mt-6 flex justify-between items-center border-t pt-4">
                    <div>
                        <Label className="mb-2">Delivery Address</Label>
                        <Input
                            name="deliveryAddress"
                            placeholder="Enter delivery address"
                            value={deliveryAddress}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <p className="font-bold text-lg">Total: ₹{total}</p>
                    <Button onClick={handlePlaceOrder}>Place Order</Button>
                </div>
            )}
        </div>
    );
}
