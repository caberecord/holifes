import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Montserrat,
  Playfair_Display,
  Oswald,
  Poppins,
  Merriweather,
  Anton,
  Cormorant_Garamond,
  Lilita_One,
  Space_Mono
} from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import { AuthContextProvider } from "../context/AuthContext";
import CookieConsent from "../components/Shared/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-poppins" });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-merriweather" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-cormorant" });
const lilita = Lilita_One({ subsets: ["latin"], weight: "400", variable: "--font-lilita" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: "Holifes - Gestión de Eventos",
  description: "Plataforma integral para la gestión de eventos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${inter.variable}
          ${montserrat.variable}
          ${playfair.variable}
          ${oswald.variable}
          ${poppins.variable}
          ${merriweather.variable}
          ${anton.variable}
          ${cormorant.variable}
          ${lilita.variable}
          ${spaceMono.variable}
          antialiased
        `}
        suppressHydrationWarning={true}
      >
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <CookieConsent />
      </body>
    </html>
  );
}
