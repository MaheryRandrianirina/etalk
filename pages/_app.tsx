import { ErrorContext } from '@/components/contexts/ErrorContext'
import { ErrorUI } from '@/components/molecules/errorUi'
import '@/styles/sass/main.scss'
import { CsrfData } from '@/types/data'
import axios from 'axios'
import type { AppProps } from 'next/app'
import localFont from "next/font/local"
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const Montserrat = localFont({src: [
  {
    path: "./fonts/Montserrat/Montserrat-Bold.otf",
    weight: "700",
    style: "bold"
  },
  {
    path: "./fonts/Montserrat/Montserrat-Italic.otf",
    weight: "400",
    style: "italic"
  },
  {
    path: "./fonts/Montserrat/Montserrat-Regular.otf",
    weight: "400",
    style: "regular",
  }
]})

export default function App({ Component, pageProps }: AppProps) {
  const [error, setError] = useState<string|null>(null) 
  
  useEffect(()=>{
    Promise.allSettled([
      axios.get(`http://localhost:3000/api/socket`), 
      axios.get("/api/csrf")
    ]).then((res)=>{
      if(res[1].status === "fulfilled"){
        const { csrf } = res[1].value.data as CsrfData
        sessionStorage.setItem("_csrf", csrf)
      }else {
        // reprocess the csrf token retrieval
        axios.get("/api/csrf").catch(error => setError("Il y a eu une erreur lors de la recuperation du token csrf"))
      }

      if(res[0].status === "rejected") {
        setError(res[0].reason)
      }
    })

  }, [])

  return <main className={Montserrat.className} style={{width: "100%", height: "100%"}}>
      <ErrorContext.Provider value={setError}>
        <Component {...pageProps} />
      </ErrorContext.Provider>
      {error && createPortal(
          <ErrorUI message={error}/>,
          document.querySelector("main") as HTMLElement
      )}
    </main>
}
