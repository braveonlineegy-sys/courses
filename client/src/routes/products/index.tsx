import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/products/")({
  component: Products,
  // head: () => ({
  //   meta: [
  //     {
  //       title: "All Products ",
  //     },
  //     {
  //       name: "description",
  //       content:
  //         "Browse our exclusive collection of electronics, headphones, and accessories. Best prices and fast shipping.",
  //     },

  //     // Open Graph (Facebook, WhatsApp, Messenger, LinkedIn)
  //     {
  //       property: "og:title",
  //       content: "All Products",
  //     },
  //     {
  //       property: "og:description",
  //       content:
  //         "Browse our exclusive collection of electronics. 45+ items in stock ready to ship.",
  //     },
  //     {
  //       property: "og:type",
  //       content: "website",
  //     },
  //     {
  //       property: "og:url",
  //       content: "http://localhost:3000/products", // ⚠️ REPLACE with your actual domain
  //     },
  //     {
  //       property: "og:image",
  //       content:
  //         "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  //     },

  //     // Twitter / X
  //     {
  //       name: "twitter:card",
  //       content: "summary_large_image", // This makes the big card
  //     },
  //     {
  //       name: "twitter:title",
  //       content: "All Products | BHVR Store",
  //     },
  //     {
  //       name: "twitter:description",
  //       content:
  //         "Browse our exclusive collection of electronics, headphones, and accessories.",
  //     },
  //     {
  //       name: "twitter:image",
  //       content:
  //         "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  //     },
  //     {
  //       name: "twitter:url",
  //       content: "http://localhost:3000/products", // ⚠️ REPLACE with your actual domain
  //     },
  //   ],
  // }),
});
function Products() {
  // Ensure your hook returns 'refetch'
  // const { data, isLoading, isError, refetch } = useProducts();

  // if (isError) {
  //   return (
  //     <ProductError
  //       message="We couldn't load the products. Please check your connection."
  //       onRetry={() => refetch()}
  //     />
  //   );
  // }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Product Page</h1>
    </div>
  );
}

export default Products;
