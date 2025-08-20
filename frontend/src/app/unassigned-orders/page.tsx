"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { setOrders, updateOrderStatus } from "@/redux/orderSlice";

export default function UnassignedOrders() {
    const orders = useSelector((state: RootState) => state.orders.orders);
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:5000/api/delivery/orders/unassigned", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                dispatch(setOrders(data));
            } catch (err) {
                console.error("Error fetching orders", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [dispatch]);

    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    const handleUpdateStatusPage = () => {
        router.push("/update-status");
    };

    const handleAcceptOrder = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/delivery/orders/accept/${id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.status === 200) {
                dispatch(updateOrderStatus({ id, status: "ACCEPTED" }));
            } else {
                const errorData = await res.json();
                alert(errorData.message || "Failed to accept order");
            }
        } catch (err) {
            console.error("Error accepting order", err);
            alert("Something went wrong while accepting order");
        }
    };

    if (loading) return <p className="p-4">Loading unassigned orders...</p>;

    const unassignedOrders = orders.filter((order) => order.status === "PLACED");

    if (unassignedOrders.length === 0)
        return (
            <div className="p-4 text-center">
                <div className="flex justify-center items-center relative mb-4">
                    <h1 className="text-xl font-bold">Unassigned Orders</h1>
                    <div className="absolute right-0 flex gap-3">
                        <button
                            onClick={handleUpdateStatusPage}
                            className="hover:text-blue-500"
                            title="Update Status"
                        >
                            <FileText className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="hover:text-red-500"
                            title="Logout"
                        >
                            <LogOut className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <p>No unassigned orders available</p>
            </div>
        );

    return (
        <div className="p-4">
            <div className="flex justify-center items-center relative mb-4">
                <h1 className="text-xl font-bold">Unassigned Orders</h1>
                <div className="absolute right-0 flex gap-3">
                    <button
                        onClick={handleUpdateStatusPage}
                        className="hover:text-blue-500"
                        title="Update Status"
                    >
                        <FileText className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="hover:text-red-500"
                        title="Logout"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
                {unassignedOrders.map((order) => (
                    <Card key={order._id} className="shadow-md">
                        <CardHeader className="pt-2">
                            <CardTitle className="flex justify-between items-center">
                                <span>Order ID: {order._id.slice(-6)}</span>
                                <Badge variant="outline">{order.status}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-2">
                                <strong>Address:</strong> {order.deliveryAddress}
                            </p>
                            <div>
                                <p className="font-semibold mb-1">Items:</p>
                                <ul className="text-sm list-disc list-inside space-y-1">
                                    {order.items.map((item) => (
                                        <li key={item._id}>
                                            {item.sku} — Qty: {item.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-sm mt-2">
                                <strong>Total:</strong> ₹{order.totalAmount}
                            </p>
                        </CardContent>

                        <CardFooter className="pb-2">
                            <Button
                                className="w-full"
                                onClick={() => handleAcceptOrder(order._id)}
                            >
                                ACCEPT ORDER
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
