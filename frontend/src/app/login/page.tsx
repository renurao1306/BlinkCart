"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UserRole = "customer" | "delivery" | "admin";

interface LoginForm {
  email: string;
  password: string;
}


export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("customer");
  const [formData, setFormData] = useState<LoginForm>({ email: "", password: "" });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let endpoint = "";
    if (role === "customer") {
      endpoint = "http://52.66.211.139:5000/api/customers/login";
    } else if (role === "delivery") {
      endpoint = "http://52.66.211.139:5000/api/delivery/login";
    } else if (role === "admin") {
      endpoint = "http://52.66.211.139:5000/api/admin/login";
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      console.log("Logged in:", data);

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", role);
      }

      if (role === "customer") {
        router.push("/product-catalog");
      } else if (role === "delivery") {
        router.push("/unassigned-orders");
      } else if (role === "admin") {
        router.push("/admin-dashboard");
      }

    } catch (err) {
      console.error("Error:", err);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>

          <Label className="mb-2">Login As</Label>
          <Select
            onValueChange={(val: UserRole) => setRole(val)}
            defaultValue="customer"
          >

            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="delivery">Delivery Partner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-2">Email</Label>
              <Input type="email" name="email" placeholder="Enter email" onChange={handleChange} required />
            </div>
            <div>
              <Label className="mb-2">Password</Label>
              <Input type="password" name="password" placeholder="Enter password" onChange={handleChange} required />
            </div>

            <Button type="submit" className="w-full">Login</Button>
          </form>

          <p className="text-center mt-4 text-sm">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-blue-600 hover:underline"
            >
              Register
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
