import type { Metadata } from "next";
import { Inter, Outfit, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const serif = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
    variable: "--font-serif",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export const metadata: Metadata = {
    title: "Khuli-kitab - Chat",
    description: "A premium AI chat interface",
    icons: {
        icon: [],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${outfit.variable} ${serif.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
