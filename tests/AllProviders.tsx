import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { CartProvider } from "../src/providers/CartProvider";
import { Theme } from "@radix-ui/themes";
import ReduxProvider from "../src/providers/ReduxProvider";

const AllProviders = ({ children }: PropsWithChildren) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={client}>
      <ReduxProvider>
        <CartProvider>
          <Theme>{children}</Theme>
        </CartProvider>
      </ReduxProvider>
    </QueryClientProvider>
  );
};

export default AllProviders;
