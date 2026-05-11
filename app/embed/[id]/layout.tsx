export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-white m-0 p-0">
        {children}
      </body>
    </html>
  );
}
