import { useRouter } from 'next/router'
import Head from 'next/head'
import { getVideo } from '../../lib/api' 

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true
  };
}

export async function getStaticProps({ params }) {
  const data = await getVideo(params.id);

  const shouldRevalidate =
    data === null || (Array.isArray(data?.videos) && data.videos.length === 0);

  return {
    props: { data },
    ...(shouldRevalidate && { revalidate: 3600 }),
  };
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

  let parseDescription = (desc) => {
    const separator = '<br /><br />'
    let output = ""
    
    if (desc !== undefined && desc != null) {
      const paragraphs = desc.split(separator)
      output = paragraphs[0]
      if (paragraphs.length > 1) {
        output += separator + paragraphs[1]
      }
    }

    return {__html: output}
  }

  return (
    <>
      <Head>
        <title>
          {router.isFallback
            ? "Descarrega vídeos de TV3"
            : !data
            ? "Descarrega vídeos de TV3"
            : `Descarrega vídeos de TV3 - ${data.title}`}
        </title>
        {data ? <meta name="description" content={data.description} /> : ""}
      </Head>
      <div>
        {router.isFallback ? (
          <div>Cercant vídeos...</div>
        ) : !data ? (
          <div>No s'ha trobat cap vídeo associat a aquesta adreça</div>
        ) : (
          <div
            className="videoCard"
            style={{ backgroundImage: `url('${data.imgsrc}')` }}
          >
            <div className="info">
              <h2>{data.title}</h2>
              <p
                className="synopsis"
                dangerouslySetInnerHTML={parseDescription(data.description)}
              ></p>
              {data.videos.length > 0 ? (
                <>
                  <h3>Vídeos</h3>
                  <div className="links">
                    {data.videos.sort(videosCompare).map((video) => {
                      return (
                        <a key={video.url} href={video.url}>
                          {video.quality} <span>{video.format}</span>
                        </a>
                      );
                    })}
                  </div>
                </>
              ) : (
                ""
              )}
              {data.audioDescriptionVideos.length > 0 ? (
                <>
                  <h3>Vídeos amb audiodescripció</h3>
                  <div className="links">
                    {data.audioDescriptionVideos
                      .sort(videosCompare)
                      .map((video) => {
                        return (
                          <a key={video.url} href={video.url}>
                            {video.quality} <span>{video.format}</span>
                          </a>
                        );
                      })}
                  </div>
                </>
              ) : (
                ""
              )}
              {data.subtitles.length > 0 ? (
                <>
                  <h3>Subtítols</h3>
                  <div className="links">
                    {data.subtitles.map((sub) => {
                      return (
                        <a key={sub.url} href={sub.url} download>
                          {sub.text} <span>{sub.format}</span>
                        </a>
                      );
                    })}
                  </div>
                </>
              ) : (
                ""
              )}
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .videoCard {
          background-image: url("https://statics.ccma.cat/multimedia/jpg/0/4/1584661891640.jpg");
          background-repeat: no-repeat;
          background-position: top right;
          background-color: black;
          background-size: contain;
          background-color: linear-gradient;
          border-radius: 5px;
          overflow: hidden;
        }

        .info {
          width: 100%;
          background-image: linear-gradient(
            to top,
            black,
            black 85%,
            transparent
          );
          color: white;
          padding: 24px;
          margin-top: 30vw;
        }

        @media (min-width: 850px) {
          .info {
            min-height: 400px;
            width: 60%;
            background-image: linear-gradient(
              to right,
              black,
              black 78%,
              transparent
            );
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
          margin-bottom: 18px;
          display: flex;
          flex-wrap: wrap;
        }

        .links a {
          padding: 6px 12px;
          font-size: 0.9em;
          border-radius: 5px;
          border: 1px solid white;
          color: black;
          background-color: white;
          margin-right: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
          margin-bottom: 12px;
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
  );
}