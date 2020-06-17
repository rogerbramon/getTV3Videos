import { useRouter } from 'next/router'
import Head from 'next/head'

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true
  };
}

export async function getStaticProps({ params }) {
  let outputVideos = []
  let subtitles = []
  let audioDescriptionVideos = []

  let response = await fetch(`http://dinamics.ccma.cat/pvideo/media.jsp?media=video&version=0s&idint=${params.id}`)
  if (!response.ok) {
    return { props: { data: null} }
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

  const data = {
    title: body.informacio.titol,
    description: body.informacio.descripcio,
    imgsrc: body.imatges.url,
    videos: outputVideos,
    audioDescriptionVideos: audioDescriptionVideos,
    subtitles: subtitles
  }

  // Pass post data to the page via props
  return { props: { data } }
}

export default function Video({ data }) {
  const router = useRouter()

  let videosCompare = (a,b) => {
    var qualityA = a.quality.toUpperCase();
    var qualityB = b.quality.toUpperCase();
    if (qualityA < qualityB) {
      return -1;
    }
    if (qualityA > qualityB) {
      return 1;
    }

    return 0;
  }

  return (
    <>
      <Head>
        <title>
          {
            router.isFallback? 'Descarrega vídeos de TV3':
            !data? 'Descarrega vídeos de TV3':
            `Descarrega vídeos de TV3 - ${data.title}`
          }
        </title>
      </Head>
      <div>
        {router.isFallback? <div>Cercant vídeos...</div>:
        !data? <div>No s'ha trobat cap vídeo associat a aquesta adreça</div>:
        <div className="videoCard" style={ {backgroundImage: `url('${data.imgsrc}')`} }>
          <div className="info">
            <h2>{data.title}</h2>
            <p className="synopsis">{data.description}</p>
            {
              (data.videos.length > 0)?
                <div className="links">
                  <h3>Vídeos</h3>
                  {data.videos.sort(videosCompare).map((video) => {
                    return (
                      <a key={video.url} href={video.url}>{video.quality} <span>{video.format}</span></a>
                    )
                  })}
                </div>
              :''
            }
            {
              (data.audioDescriptionVideos.length > 0)?
                <div className="links">
                  <h3>Vídeos amb audiodescripció</h3>
                  {data.audioDescriptionVideos.sort(videosCompare).map((video) => {
                    return (
                      <a key={video.url} href={video.url}>{video.quality} <span>{video.format}</span></a>
                    )
                  })}
                </div>
              :''
            }
            {
              (data.subtitles.length > 0)?
                <div className="links">
                  <h3>Subtítols</h3>
                  {data.subtitles.map((sub) => {
                    return (
                      <a key={sub.url} href={sub.url} download>{sub.text} <span>{sub.format}</span></a>
                    )
                  })}
                </div>
              : ''
            }
          </div>
        </div>
        }
      </div>
      <style jsx>{`
        .videoCard {
          background-image: url("https://statics.ccma.cat/multimedia/jpg/0/4/1584661891640.jpg");
          background-repeat: no-repeat;
          background-position: top right;
          background-color:  black;
          background-size: contain;
          background-color: linear-gradient;
          border-radius: 5px;
          overflow: hidden;
        }

        .info {
          width: 100%;
          background-image: linear-gradient(to top, black, black 85%, transparent);
          color: white;
          padding: 24px;
          margin-top: 30vw;
        }

        @media (min-width: 850px) {
          .info {
            min-height: 400px;
            width: 60%;
            background-image: linear-gradient(to right, black, black 78%, transparent);
            padding: 24px;
            padding-right: 48px;
            margin-top: 0;
          }
        }

        .synopsis {
          color: gray;
          line-height: 1.2rem;
          font-size: 0.9em;
        }

        h2 {
          margin-top: 0;
          font-size: 1.2rem;
        }

        h3 {
          font-size: 0.98em;
          color: #eee;
        }

        .links {
          margin-bottom: 30px;
        }

        .links a {
          width: 150px;
          padding: 6px 12px;
          font-size: 0.9em;
          border-radius: 5px;
          border: 1px solid white;
          color: black;
          background-color: white;
          margin-right: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .links a:hover {
          background-color: lightgray;
          border-color: gray;
        }

        .links a span {
          color: gray;
        }

      `}</style>
    </>
  )
}