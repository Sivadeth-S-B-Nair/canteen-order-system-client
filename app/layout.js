import useSocket from "@/hooks/useSocket";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";

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
        </StoreProvider>
      </body>
    </html>
  );
}
