import type { Metadata } from "next";
import {
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
import "../globals.css";

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
    title: "Evento",
    description: "Detalles del evento",
};

export default function SitesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body
                className={`
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
            >
                {children}
            </body>
        </html>
    );
}
