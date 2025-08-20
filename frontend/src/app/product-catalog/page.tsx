"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, FileText, LogOut } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { addToCart, updateQuantity } from "@/redux/cartSlice";
import { useRouter } from "next/navigation";

type Product = {
    _id: string;
    sku: string;
    name: string;
    price: number;
    stock: number;
};

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();
  const cart = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/customers/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [cart]);

  const getQuantity = (sku: string) =>
    cart.find((item) => item.sku === sku)?.quantity || 0;

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-center flex-1">
          Product Catalog
        </h1>
        <div className="flex items-center gap-6">
          
          <Link href="/order-status">
            <div className="relative cursor-pointer">
              <FileText className="w-6 h-6" />
            </div>
          </Link>

          <Link href="/cart">
            <div className="relative cursor-pointer">
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </div>
          </Link>

          <div className="cursor-pointer" onClick={handleLogout}>
            <LogOut className="w-6 h-6 hover:text-red-500 transition-colors" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => {
          const quantity = getQuantity(product.sku);
          return (
            <Card
              key={product._id}
              className="hover:shadow-lg transition-all py-4"
            >
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  SKU: {product.sku}
                </p>
                <p className="font-semibold mt-2">₹{product.price}</p>
                <p className="text-sm">Stock: {product.stock}</p>
              </CardContent>
              <CardFooter>
                {quantity === 0 ? (
                  <Button
                    className="w-full"
                    onClick={() => dispatch(addToCart(product.sku))}
                  >
                    Add to Cart
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 w-full justify-center">
                    <Button
                      variant="outline"
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            sku: product.sku,
                            quantity: Math.max(quantity - 1, 1),
                          })
                        )
                      }
                    >
                      -
                    </Button>
                    <span className="px-4 font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            sku: product.sku,
                            quantity: Math.min(quantity + 1, product.stock),
                          })
                        )
                      }
                    >
                      +
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
