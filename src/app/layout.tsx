import type { Metadata } from "next";
import "../components/assets/fonts/style.css";
//import "../components/assets/styles/main.scss";
import "./globals.css";
import Layout from "@/components/layout";
import Script from "next/script";

export const metadata: Metadata = {
    title: "Manifest.report",
    description: "Find the changes you're looking for.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <Script
                    async
                    src="https://user-stats.itssimple.se/script.js"
                    data-website-id="be6cd048-22a3-4ad2-b70b-1e2d5e73ae59"
                    data-performance="true"
                />
            </head>
            <body className={`destiny antialiased`}>
                <Layout>{children}</Layout>
            </body>
        </html>
    );
}
