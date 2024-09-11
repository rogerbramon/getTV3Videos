
export async function getVideo(id) {
  let outputVideos = []
  let subtitles = []
  let audioDescriptionVideos = []

  let response = await fetch(`http://dinamics.ccma.cat/pvideo/media.jsp?media=video&version=0s&idint=${id}`)
  if (!response.ok) {
    return null
  }

  const body = await response.json();

  if (body !== undefined && body.informacio.estat.actiu) {
    const media = body.media
    const urls = [].concat(media.url)

    urls.forEach(url => {
      outputVideos.push({
        format: media.format,
        quality: url.label,
        url: url.file
      })
    });

    if (body.subtitols !== undefined) {
      subtitles = [].concat(body.subtitols)
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
          url: url.file,
        });
      });
    }
  }

  const data = {
    title: body.informacio.titol,
    description: body.informacio.descripcio,
    imgsrc: body.imatges.url,
    videos: outputVideos,
    audioDescriptionVideos: audioDescriptionVideos,
    subtitles: subtitles
  }

  // Pass post data to the page via props
  return data
}