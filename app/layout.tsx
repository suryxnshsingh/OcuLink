import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import 'react-datepicker/dist/react-datepicker.css';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import './my-styles.css';
import { ClerkProvider } from "@clerk/nextjs";
import { neobrutalism } from '@clerk/themes'
import { Toaster } from "@/components/ui/toaster"
import { Poppins } from 'next/font/google'

const poppins = Poppins({ 
  weight: ['100','200','300','400','500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

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
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
      >
        <body
          className={` ${poppins.variable} antialiased poppins lg:text-nowrap`}>
          {children}
          <Toaster/>
        </body>
      </ClerkProvider>
    </html>
  );
}
