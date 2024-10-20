const URL_REPLACEMENTS = [
  {
    from: "mp4-high-es.ccma.cat.s3.eu-west-1.amazonaws.com/MP4_ALTA_IPTV_ES",
    to: "mp4-down-high-es.3cat.cat",
  },
  {
    from: "mp4-medium-es.ccma.cat.s3.eu-west-1.amazonaws.com/MP4_MITJA_WEB_ES",
    to: "mp4-down-medium-es.3cat.cat",
  },
];

function replaceUrl(url) {
  return URL_REPLACEMENTS.reduce(
    (acc, { from, to }) => acc.replace(from, to),
    url
  );
}

export async function getVideo(id) {
  let outputVideos = [];
  let subtitles = [];
  let audioDescriptionVideos = [];

  let response = await fetch(
    `https://dinamics.ccma.cat/pvideo/media.jsp?media=video&version=0s&idint=${id}`
  );
  if (!response.ok) {
    return null;
  }

  const body = await response.json();

  console.log(body.media);

  if (body !== undefined && body.informacio.estat.actiu) {
    const media = body.media;
    const urls = [].concat(media.url);

    urls.forEach((url) => {
      outputVideos.push({
        format: media.format,
        quality: url.label,
        url: replaceUrl(url.file),
      });
    });

    // if outputvideos contains both 720p and 480p, replace the quality for 720p with "HD" and 480p with "SD". only perform the
    // replacement if both qualities are present
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
      subtitles = [].concat(body.subtitols);
    }

    const variants = body.variants;
    const varaintAud = Array.isArray(variants)
      ? variants.find((variant) => variant.id === "AUD")
      : undefined;
    if (varaintAud) {
      const variantsMedia = varaintAud.media;
      const urls = [].concat(variantsMedia.url);

      urls.forEach((url) => {
        audioDescriptionVideos.push({
          format: variantsMedia.format,
          quality: url.label,
          url: replaceUrl(url.file),
        });
      });
    }
  }

  const data = {
    title: body.informacio.titol,
    description: body.informacio.descripcio || "",
    imgsrc: body.imatges.url,
    videos: outputVideos,
    audioDescriptionVideos: audioDescriptionVideos,
    subtitles: subtitles,
  };

  // Pass post data to the page via props
  return data;
}
