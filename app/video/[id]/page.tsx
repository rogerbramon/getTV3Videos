import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getVideo } from "@/lib/api";
import VideoCard from "@/components/video-card";

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

// Return a sample ID for build-time validation
// This allows Next.js to validate the page structure
export async function generateStaticParams() {
  return [{ id: '6595890' }]; // A valid sample video ID
}

async function VideoContent({ id }: { id: string }) {
  const data = await getVideo(id);

  if (!data) {
    notFound();
  }

  return <VideoCard data={data} />;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  return (
    <div>
      <Suspense fallback={<div className="text-center py-8">Cercant vídeos...</div>}>
        <VideoContent id={id} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: VideoPageProps) {
  const { id } = await params;
  const data = await getVideo(id);

  if (!data) {
    return {
      title: "Descarrega vídeos de TV3",
    };
  }

  return {
    title: `Descarrega vídeos de TV3 - ${data.title}`,
    description: data.description,
  };
}

