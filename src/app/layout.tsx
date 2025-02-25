import type { Metadata } from "next";
import "../components/assets/fonts/style.css";
//import "../components/assets/styles/main.scss";
import "./globals.css";
import Layout from "@/components/layout";

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
            <body className={`destiny antialiased`}>
                <Layout>{children}</Layout>
            </body>
        </html>
    );
}
