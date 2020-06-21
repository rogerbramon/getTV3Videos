import Search from './Search'
import Head from 'next/head'

export default function Layout(props) {

  return (
    <>
      <Head>
        <meta name="author" content="Roger Bramon, http://twitter.com/rogerbramon" />
      </Head>

      <div className="container">
        <main>
          <h1 className="title">Descarrega vídeos de TV3</h1>
          <Search></Search>
          {props.children}
        </main>
        <footer>
          Roger Bramon{' · '}
          <a href="http://twitter.com/rogerbramon">@rogerbramon</a>{' · '}
          <a href="http://github.com/rogerbramon/getTV3Videos">GitHub</a>
        </footer>
      </div>
      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        main {
          margin: 0 auto;
          width: 100%;
          max-width: 1100px;
          padding: 24px 12px;
          flex-grow: 1;
        }

        footer {
          width: 100%;
          height: 60px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 0.8rem;
          white-space: break-spaces;
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