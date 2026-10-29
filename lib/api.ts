"use cache";

// Type definitions
export interface Video {
  format: string;
  quality: string;
  url: string;
}

export interface Subtitle {
  url: string;
  text: string;
  format: string;
}

export interface VideoData {
  title: string;
  description: string;
  imgsrc: string;
  videos: Video[];
  dashUrl: string | null;
  audioDescriptionVideos: Video[];
  subtitles: Subtitle[];
}

interface UrlReplacement {
  from: string;
  to: string;
}

interface ApiUrl {
  file: string;
  label: string;
}

interface ApiMedia {
  format: string;
  url: ApiUrl | ApiUrl[];
}

interface ApiVariant {
  id: string;
  media: ApiMedia;
}

interface ApiResponse {
  informacio: {
    estat: {
      actiu: boolean;
    };
    titol: string;
    descripcio?: string;
  };
  media: ApiMedia;
  imatges: {
    url: string;
  };
  subtitols?: Subtitle | Subtitle[];
  variants?: ApiVariant | ApiVariant[];
}

const URL_REPLACEMENTS: UrlReplacement[] = [
  {
    from: "mp4-high-es.ccma.cat.s3.eu-west-1.amazonaws.com/MP4_ALTA_IPTV_ES",
    to: "mp4-down-high-es.3catvideos.cat",
  },
  {
    from: "mp4-high-int.ccma.cat.s3.eu-west-1.amazonaws.com/MP4_ALTA_IPTV_MON",
    to: "mp4-down-high-int.3catvideos.cat",
  },
  {
    from: "mp4-medium-es.ccma.cat.s3.eu-west-1.amazonaws.com/MP4_MITJA_WEB_ES",
    to: "mp4-down-medium-es.3catvideos.cat",
  },
  {
    from: "mp4-medium-int.ccma.cat.s3.eu-west-1.amazonaws.com/MP4_MITJA_WEB_MON",
    to: "mp4-down-medium-int.3catvideos.cat",
  },
];

function isDashUrl(url: ApiUrl): boolean {
  return url.file.endsWith(".mpd");
}

function replaceUrl(url: string): string {
  return URL_REPLACEMENTS.reduce(
    (acc, { from, to }) => acc.replace(from, to),
    url
  );
}

export async function getVideo(id: string): Promise<VideoData | null> {
  let outputVideos: Video[] = [];
  let subtitles: Subtitle[] = [];
  let audioDescriptionVideos: Video[] = [];
  let dashUrl: string | null = null;

  try {
    const response = await fetch(
      `https://dinamics.ccma.cat/pvideo/media.jsp?media=video&version=0s&idint=${id}&format=dm`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as ApiResponse;

    if (body !== undefined && body.informacio.estat.actiu) {
      const media = body.media;
      const urls = Array.isArray(media.url) ? media.url : [media.url];

      dashUrl = urls.find(isDashUrl)?.file ?? null;

      urls.filter((url) => !isDashUrl(url)).forEach((url) => {
        outputVideos.push({
          format: media.format,
          quality: url.label,
          url: replaceUrl(url.file),
        });
      });

      // If outputvideos contains both 720p and 480p, replace the quality for 720p with "HD" and 480p with "SD"
      const has720pAnd480p =
        outputVideos.some((video) => video.quality === "720p") &&
        outputVideos.some((video) => video.quality === "480p");

      if (has720pAnd480p) {
        outputVideos.forEach((video) => {
          if (video.quality === "720p") {
            video.quality = "Alta qualitat";
          } else if (video.quality === "480p") {
            video.quality = "Mitjana qualitat";
          }
        });
      } else if (outputVideos.length === 1) {
        outputVideos[0].quality = "Alta qualitat";
      }

      if (body.subtitols !== undefined) {
        subtitles = Array.isArray(body.subtitols)
          ? body.subtitols
          : [body.subtitols];
      }

      const variants = body.variants;
      const variantAud = Array.isArray(variants)
        ? variants.find((variant) => variant.id === "AUD")
        : variants?.id === "AUD"
        ? variants
        : undefined;

      if (variantAud) {
        const variantsMedia = variantAud.media;
        const urls = Array.isArray(variantsMedia.url)
          ? variantsMedia.url
          : [variantsMedia.url];

        urls.filter((url) => !isDashUrl(url)).forEach((url) => {
          audioDescriptionVideos.push({
            format: variantsMedia.format,
            quality: url.label,
            url: replaceUrl(url.file),
          });
        });
      }
    }

    const data: VideoData = {
      title: body.informacio.titol,
      description: body.informacio.descripcio || "",
      imgsrc: body.imatges.url,
      videos: outputVideos,
      dashUrl: dashUrl,
      audioDescriptionVideos: audioDescriptionVideos,
      subtitles: subtitles,
    };

    return data;
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}

