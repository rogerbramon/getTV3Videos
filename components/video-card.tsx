import { VideoData, Video } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { DashDownloads } from "@/components/dash-downloads";

interface VideoCardProps {
  data: VideoData;
}

function videosCompare(a: Video, b: Video): number {
  const qualityA = a.quality.toUpperCase();
  const qualityB = b.quality.toUpperCase();
  if (qualityA < qualityB) {
    return -1;
  }
  if (qualityA > qualityB) {
    return 1;
  }
  return 0;
}

function parseDescription(desc: string): string {
  const separator = "<br /><br />";
  let output = "";

  if (desc !== undefined && desc != null) {
    const paragraphs = desc.split(separator);
    output = paragraphs[0];
    if (paragraphs.length > 1) {
      output += separator + paragraphs[1];
    }
  }

  return output;
}

export default function VideoCard({ data }: VideoCardProps) {
  return (
    <div
      className="relative rounded-lg overflow-hidden bg-no-repeat bg-top-right bg-contain bg-black"
      style={{ backgroundImage: `url('${data.imgsrc}')` }}
    >
      <div className="w-full md:w-3/5 mt-[30vw] md:mt-0 md:min-h-[400px] bg-gradient-to-t md:bg-gradient-to-r from-black via-black to-transparent p-6 md:pr-12">
        <h2 className="text-white text-xl font-semibold mb-4 mt-0">{data.title}</h2>
        
        {data.description && (
          <div
            className="text-neutral-400 text-sm leading-5 mb-6"
            dangerouslySetInnerHTML={{ __html: parseDescription(data.description) }}
          />
        )}

        {data.videos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-neutral-200 text-base mb-3">Vídeos</h3>
            <div className="flex flex-wrap gap-3">
              {data.videos.sort(videosCompare).map((video) => (
                <a
                  key={video.url}
                  href={video.url}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-white bg-white text-black hover:bg-neutral-200 hover:border-neutral-300 transition-colors no-underline"
                >
                  <Download className="h-4 w-4" />
                  {video.quality}
                  <Badge variant="outline" className="ml-1 text-neutral-600 border-neutral-400">
                    {video.format}
                  </Badge>
                </a>
              ))}
            </div>
          </div>
        )}

        {data.dashUrl && <DashDownloads mpdUrl={data.dashUrl} title={data.title} />}

        {data.audioDescriptionVideos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-neutral-200 text-base mb-3">Vídeos amb audiodescripció</h3>
            <div className="flex flex-wrap gap-3">
              {data.audioDescriptionVideos.sort(videosCompare).map((video) => (
                <a
                  key={video.url}
                  href={video.url}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-white bg-white text-black hover:bg-neutral-200 hover:border-neutral-300 transition-colors no-underline"
                >
                  <Download className="h-4 w-4" />
                  {video.quality}
                  <Badge variant="outline" className="ml-1 text-neutral-600 border-neutral-400">
                    {video.format}
                  </Badge>
                </a>
              ))}
            </div>
          </div>
        )}

        {data.subtitles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-neutral-200 text-base mb-3">Subtítols</h3>
            <div className="flex flex-wrap gap-3">
              {data.subtitles.map((sub) => (
                <a
                  key={sub.url}
                  href={sub.url}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-white bg-white text-black hover:bg-neutral-200 hover:border-neutral-300 transition-colors no-underline"
                >
                  <Download className="h-4 w-4" />
                  {sub.text}
                  <Badge variant="outline" className="ml-1 text-neutral-600 border-neutral-400">
                    {sub.format}
                  </Badge>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

