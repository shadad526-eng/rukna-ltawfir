import { createFileRoute } from "@tanstack/react-router";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const Route = createFileRoute("/admin/products/new")({ ssr: false, component: NewProductPage });

function NewProductPage() {
  return <ProductEditor />;
}
