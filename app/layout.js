import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Voiture Alert",
  description: "Suivi automatique des annonces de voitures (Ouedkniss, etc.)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
