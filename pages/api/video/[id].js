
export default async (req, res) => {
  const {
    query: { id },
    method,
  } = req

  if (method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  let outputVideos = []
  let subtitles = []
  let audioDescriptionVideos = []

  let response = await fetch(`http://dinamics.ccma.cat/pvideo/media.jsp?media=video&version=0s&idint=${id}`)
  if (!response.ok) {
    return res.status(response.status).end()
  }

  const body = JSON.parse(await response.textConverted())

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

    const variants = body.variants
    if (variants !== undefined && variants.id === "AUD") {
        const variantsMedia = variants.media
        const urls = [].concat(variantsMedia.url)

        urls.forEach(url => {
          audioDescriptionVideos.push({
            format: variantsMedia.format,
            quality: url.label,
            url: url.file
          });
        });
    }
  }

  const output = {
    title: body.informacio.titol,
    description: body.informacio.descripcio,
    imgsrc: body.imatges.url,
    videos: outputVideos,
    audioDescriptionVideos: audioDescriptionVideos,
    subtitles: subtitles
  }

  res.status(200).json(output)
}