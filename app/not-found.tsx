export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-semibold mb-2">Vídeo no trobat</h2>
      <p className="text-muted-foreground">
        No s'ha trobat cap vídeo associat a aquesta adreça
      </p>
    </div>
  );
}

