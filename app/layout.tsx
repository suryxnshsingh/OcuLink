import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
// import '@stream-io/video-react-sdk/dist/css/styles.css';
// import './my-styles.css';
import { ClerkProvider } from "@clerk/nextjs";
import { dark, neobrutalism } from '@clerk/themes'
import { Toaster } from "@/components/ui/toaster"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "OcuLink",
  description: "A feature-rich video chat app",
  icons: {
    icon: {
      url: "/icons/video-chat.png",
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClerkProvider
      appearance={{
        baseTheme: neobrutalism,
      }}
      >
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
          <Toaster/>
        </body>
      </ClerkProvider>
    </html>
  );
}
