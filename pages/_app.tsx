import '@/styles/sass/main.scss'
import axios from 'axios'
import type { AppProps } from 'next/app'
import localFont from "next/font/local"
import { useEffect } from 'react'

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
  
  useEffect(()=>{
    axios.get(`http://localhost:3000/api/socket`).catch(console.error)
  }, [])

  return <main className={Montserrat.className} style={{width: "100%", height: "100%"}}>
      <Component {...pageProps} />
    </main>
}
