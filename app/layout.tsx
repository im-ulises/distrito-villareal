import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Distrito Villarreal | Plaza comercial en Ciudad Juárez",
  description:
    "Distrito Villarreal integra comercio, consultorios y arquitectura contemporánea en Ciudad Juárez, Chihuahua.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
