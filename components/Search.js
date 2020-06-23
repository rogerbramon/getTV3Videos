import Link from 'next/link'
import { useState } from 'react'

export default function Search() {
  let [ videoCode, setVideoCode ] = useState()

  let updateCode = (event) => {
    const ids = event.target.value.split("/").filter( function(element) {
      return element.match(/^\d+$/);
    })
    if (ids.length > 0) {
      setVideoCode(ids[ids.length - 1])
    } 
    else {
      setVideoCode(undefined)
    }
  }

  return (
    <>
      <div className="search">
        <label htmlFor="video-code" className="description">Introduïu l'adreça del vídeo</label>
        <div>
          <input id="video-code" onChange={updateCode} type="text" placeholder="https://www.ccma.cat/tv3/alacarta/les-de-lhoquei/anna/video/5851449/" />
          <Link href="/video/[id]" as={`/video/${videoCode}`}>
            <button id="video-code-button" type="button">Buscar</button>
          </Link>
        </div>
      </div>
      <style jsx>{`
        .search {
          margin: 24px 0;
        }
        .search div {
          display: flex;
          margin-top: 12px;
        }
        .search input {
          height: 40px;
          margin-right: 12px;
          padding: 6px 12px;
          border: 1px solid gray;
          border-radius: 5px;
          flex-grow: 1;
          font-size: 1rem;
        }

        .search button {
          transition: all 0.2s ease;
          align-items: flex-start;
          text-align: center;
          cursor: pointer;
          color: white;
          height: 40px;
          width: 200px;
          font-size: 1rem;
          padding-top: 2px;
          padding-right: 6px;
          padding-bottom: 3px;
          padding-left: 6px;
          border-width: 1px;
          border-radius: 5px;
          border-style: outset;
          border-color: black;
          background-color: black;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        .search button:hover {
          color: black;
          background-color: white;
          border-color: black;
        }

        label {
          font-size: 1.3rem;
          font-weight: normal;
          color: gray;
        }
      `}</style>
    </>
  )
}