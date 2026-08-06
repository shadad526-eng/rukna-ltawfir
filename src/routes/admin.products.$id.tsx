import { createFileRoute, useParams } from "@tanstack/react-router";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const Route = createFileRoute("/admin/products/$id")({ ssr: false, component: EditProductPage });

function EditProductPage() {
  const { id } = useParams({ from: "/admin/products/$id" });
  return <ProductEditor key={id} productId={id} />;
}
