import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "./my-styles.css";
import { ClerkProvider } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

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
  title: {
    default:
      'OcuLink - Feature Rich Video Confrencing with ease',
    template: `%s - OcuLink`,
  },
  description:
    'Seamless video chat with OcuLink. Stay connected effortlessly witha beautiful neobrutalistic UI.',
  keywords: [
    'neobrutalism',
    'oculink',
    'shadcn',
    'tailwind',
    'getStream',
    'clerk',
    'suryansh',
    'suryxnshsingh',
    ''
  ],
  authors: [{ name: 'SuryanshSingh', url: 'https://github.com/suryxnshsingh' }],
  openGraph: {
    type: 'website',
    description:
      'Seamless video chat with OcuLink. Stay connected effortlessly.',
    images: ['https://github.com/suryxnshsingh/OcuLink/blob/53fabd89c5a3c8b60771d7fde65a1720df73c4f3/public/oculink2.png'],
    url: 'https://oculink.vercel.app/',
    title: 'OcuLink - Video Chat App',
  },
  metadataBase: new URL('https://oculink.vercel.app/'),
  twitter: {
    card: 'summary_large_image',
    title: 'OcuLink - Feature Rich Video Confrencing with ease',
    description:
      'Seamless video chat with OcuLink. Stay connected effortlessly witha beautiful neobrutalistic UI.',
    images: ['https://github.com/suryxnshsingh/OcuLink/blob/53fabd89c5a3c8b60771d7fde65a1720df73c4f3/public/oculink2.png'],
    creator: '@suryxnshsingh',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="OcuLink - Feature Rich Video Confrencing with ease" />
        <meta property="og:description" content="Seamless video chat with OcuLink. Stay connected effortlessly." />
        <meta property="og:url" content="https://oculink.vercel.app" />
        <meta property="og:image" content="/oculink2.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="OcuLink - Feature Rich Video Confrencing with ease" />
        <meta name="twitter:description" content="Seamless video chat with OcuLink. Stay connected effortlessly." />
        <meta name="twitter:image" content="/oculink2.png" />
      </head>
      <ClerkProvider
        appearance={{
          baseTheme: neobrutalism,
          layout: {
            unsafe_disableDevelopmentModeWarnings: true,
          },
        }}
      >
        <body
          className={` ${poppins.variable} antialiased poppins lg:text-nowrap`}
        >
          {children}
          <Toaster />
        </body>
      </ClerkProvider>
    </html>
  );
}