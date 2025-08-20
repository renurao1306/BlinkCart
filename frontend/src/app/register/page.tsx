"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
};

type DeliveryForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  vehicleNumber: string;
};

type FormData = CustomerForm | DeliveryForm;


export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"customer" | "delivery">("customer");
  const [formData, setFormData] = useState<FormData>({} as FormData);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint =
      role === "customer"
        ? "http://35.154.71.3:5000/api/customers/register"
        : "http://35.154.71.3:5000/api/delivery/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Registration failed");

      const data = await res.json();
      console.log("Registered:", data);

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      router.push("/login");
    } catch (err) {
      console.error("Error:", err);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>

          <Label className="mb-2">Register As</Label>
          <Select
            onValueChange={(val: "customer" | "delivery") => setRole(val)}
            defaultValue="customer"
          >

            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="delivery">Delivery Partner</SelectItem>
            </SelectContent>
          </Select>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-2">Name</Label>
              <Input name="name" placeholder="Enter name" onChange={handleChange} required />
            </div>
            <div>
              <Label className="mb-2">Email</Label>
              <Input type="email" name="email" placeholder="Enter email" onChange={handleChange} required />
            </div>
            <div>
              <Label className="mb-2">Phone</Label>
              <Input name="phone" placeholder="Enter phone" onChange={handleChange} required />
            </div>
            <div>
              <Label className="mb-2">Password</Label>
              <Input type="password" name="password" placeholder="Enter password" onChange={handleChange} required />
            </div>

            {role === "customer" ? (
              <div>
                <Label className="mb-2">Address</Label>
                <Input name="address" placeholder="Enter address" onChange={handleChange} required />
              </div>
            ) : (
              <div>
                <Label className="mb-2">Vehicle Number</Label>
                <Input name="vehicleNumber" placeholder="Enter vehicle number" onChange={handleChange} required />
              </div>
            )}

            <Button type="submit" className="w-full">Register</Button>
          </form>

          <p className="text-center mt-4 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:underline"
            >
              Login
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
