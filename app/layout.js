import useSocket from "@/hooks/useSocket";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Canteen Order System",
  description: "Real-time canteen ordering",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: "8px", fontSize: "14px" },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}
