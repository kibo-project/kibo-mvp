import "../globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider enableSystem>{children}</ThemeProvider>
      </body>
    </html>
  );
}
