import '../styles/sass/main.scss'
import type { AppProps } from 'next/app'
import localFont from "next/font/local"
import * as Ably from "ably";
import { AblyProvider } from 'ably/react';

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
  const client = new Ably.Realtime.Promise({ key: "6W-Ytw.AvJ4gQ:eIQrVRGLMJKYd4WI4Dhvrl2lQ_XutUbEr7qVXhFBdzk" });
  return <AblyProvider client={client}><main className={Montserrat.className} style={{width: "100%", height: "100%"}}>
      <Component {...pageProps} />
    </main>
    </AblyProvider>
}
