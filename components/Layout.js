import Search from './Search'

export default function Layout(props) {

  return (
    <>
      <div className="container">
        <h1 className="title">Descarrega vídeos de TV3</h1>
        <Search></Search>
        {props.children}
      </div>
      <style jsx>{`
        .container {
          max-width: 1100px;
          padding: 24px;
          margin: 0 auto;
        }

        a {
          color: #0070f3;
          text-decoration: none;
        }

        a:hover,
        a:focus,
        a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 1.5rem;
        }
      `}
      </style>
      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </>
  )
}