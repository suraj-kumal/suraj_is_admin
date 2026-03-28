import { ThemeProvider } from "next-themes";
import { libreBaskerville } from "@/app/fonts";
import { Toaster } from "@/components/ui/sonner";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={libreBaskerville.className}
      suppressHydrationWarning
    >
      <head></head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
