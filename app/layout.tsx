import type { Metadata } from "next";
import SearchForm from "@/components/search-form";
import "./globals.css";

export const metadata: Metadata = {
  title: "Descarrega vídeos de TV3",
  description: "Aplicació web per descarregar vídeos de TV3 - CCMA a partir de l'enllaç del vídeo.",
  authors: [{ name: "Roger Bramon", url: "http://twitter.com/rogerbramon" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow w-full max-w-[1100px] mx-auto px-3 py-6">
            <h1 className="text-2xl font-normal mb-6">Descarrega vídeos de TV3</h1>
            <SearchForm />
            {children}
          </main>
          <footer className="w-full h-[60px] border-t border-border flex items-center justify-center text-sm">
            <div className="text-center whitespace-pre-wrap">
              Roger Bramon{' · '}
              <a href="http://twitter.com/rogerbramon" className="text-primary hover:underline">
                @rogerbramon
              </a>
              {' · '}
              <a href="http://github.com/rogerbramon/getTV3Videos" className="text-primary hover:underline">
                GitHub
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

