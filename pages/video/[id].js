import { useRouter } from 'next/router'
import useSwr from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Video() {
  const router = useRouter()
  const { data, error } = useSwr(`/api/video/${router.query.id}`, fetcher)

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
      <div >
        {error? <div>Failed to load video</div>:
        !data? <div>Loading...</div>:
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
                      <a href={video.url}>{video.quality} <span>{video.format}</span></a>
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
                      <a href={video.url}>{video.quality} <span>{video.format}</span></a>
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
                      <a href={sub.url} download>{sub.text} <span>{sub.format}</span></a>
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