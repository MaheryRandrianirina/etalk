import Head from 'next/head'
import ReceptionBox from '../components/receptionbox'
import { withSessionSsr } from '../backend/utilities/withSession'
import { User } from '../types/user'
import {NextResponse} from "next/server"
import type {NextApiRequest, NextApiResponse} from "next"
import Auth from '../backend/User/Auth'
import { ChangeEvent, ChangeEventHandler, Context, Dispatch, EventHandler, Fragment, MouseEvent, MouseEventHandler, SetStateAction, SyntheticEvent, createContext, useCallback, useEffect, useState } from 'react'
import UserConversation from './conversation/[adressee_id]/[conversation_id]'
import Header from '../components/app/header'
import SearchBar from '../components/app/searchBar'
import ListActiveFriends from '../components/friends/listActiveFriends'
import SearchResults from '../components/app/searchResults'
import Footer from '../components/app/footer'
import Opening from '../components/loaders/opening'
import axios from 'axios'
import { UserConversations } from '../types/conversation'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '../types/socket/utils'
import { AppSocketState, SocketStateDispatcher } from '../types/utils'
import session from 'express-session'
import user from './api/user'
import Menu from '../components/app/menu'
import useClassnameAnimator from '../lib/hooks/useClassnameAnimator'

type AnimationClassName = {receptionBox: string, conversation: string}

export const SocketContext: Context<AppSocketState> = createContext(null as AppSocketState)

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

export default function Home({user}: {
  user: User
}) {
  
  const [conversations, setConversations]: [
    conversations: UserConversations,
    setConversations: Dispatch<SetStateAction<UserConversations>>
  ] = useState(null as UserConversations)

    const [activeSection, setActiveSection]: [
      activeSection: number,
      setActiveSection: Function
    ] = useState(1);

  const [createConversation, setCreateConversation]:[
    createConversation: boolean, 
    setCreateConversation: Dispatch<SetStateAction<boolean>>
  ] = useState(false)

  const [searchBarValue, setSearchBarValue]: [
    searchBarValue: string,
    setSearchBarValue: Dispatch<SetStateAction<string>>
  ] = useState("");

  const [isSearchResultsAppear, setSearchResultsAppear]: [
    isSearchResultsAppear: boolean,
    setSearchResultsAppear: Dispatch<SetStateAction<boolean>>
  ] = useState(false);

  const [animationClassName, setAnimationClassName]: [
    animationClassName: AnimationClassName, 
    setAnimationClassName: Dispatch<SetStateAction<AnimationClassName>>
  ] = useState({receptionBox: "", conversation: ""})

  const [backwarded,setBackwared]: [
    backwarded: boolean, 
    setBackwarded: Dispatch<SetStateAction<boolean>>
  ] = useState(false)

  const [socketState, setSocket]: [
    socketState: AppSocketState,
    setSocket: SocketStateDispatcher
  ] = useState(null as AppSocketState)

  const [showMenu, setShowMenu]: [
    showMenu: boolean,
    setShowMenu: Dispatch<SetStateAction<boolean>>
  ] = useState(false)

  /**
   * POUR L'ANIMATION DU MENU DEROULANT
   */
  const {classnameForAnimation, setClassnameForAnimation} = useClassnameAnimator("")
  
  useEffect(()=>{
      handleSocket()
      
      if(showMenu){
        setClassnameForAnimation("active")
      }else {
        setClassnameForAnimation("")
      }
  }, [showMenu])

  const handleSocket = async()=>{
      try {
        await axios.get("/api/socket")

        socket = io()
        
        setSocket(socket)
        
        socket.on('connect', ()=>{
          console.log("connected")
        })

        socket.emit("get_conversations")
        
        if(backwarded){
          socket.emit("get_conversations")
        }

        socket.on('conversations', (data)=>{
          setConversations(data)
        })
        
        return null
      }catch(e){
        console.error(e)
      }
  }

  const handleClickMessageCircle: EventHandler<SyntheticEvent> = (event: SyntheticEvent)=>{
      event.preventDefault()
      setActiveSection(1)
  }

  const handleClickUserFriends: EventHandler<SyntheticEvent> = (event: SyntheticEvent)=>{
      event.preventDefault()
      setActiveSection(2)
  }

  const handleSearchBarChange: ChangeEventHandler<HTMLInputElement> = (event:ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value
      setSearchBarValue(value)

      if(value !== ""){
          setSearchResultsAppear(true)
      }else {
          setSearchResultsAppear(false)
      }
  }

  /* 
  * Ne fait qu'ajouter de l'animation à la boite de réception.
  * C'est juste après l'animation qu'on met createConversation à true. Càd dans la transitionend
  * de l'élément reception_box
  */
  const handleCreateConversation: MouseEventHandler<HTMLButtonElement> = (e: SyntheticEvent) => {
    e.preventDefault()
    
    setAnimationClassName(ac => {
      return {...ac, receptionBox: "flip", conversation: "flip"}
    })
  }

  const handleClickSearchResult: (e: SyntheticEvent)=>void = (e)=>{

  }

  const handleClickMenu: MouseEventHandler<HTMLDivElement> = (e:MouseEvent) =>  {
    e.preventDefault();
    
    setShowMenu(show => !show)    
  }

  return (
    <div className='app_container' style={{height:"100%"}}>
      <Head>
        <title>Boite de réception</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SocketContext.Provider value={socket}>
      {conversations === null && <Opening />}
      {(createConversation === false && activeSection === 1 && conversations) && <ReceptionBox 
          onClickMenu={handleClickMenu}
          backwarded={backwarded}
          setBackwarded={setBackwared}
          conversations={conversations} searchResults={{
            appear: isSearchResultsAppear,
            handleClickSearchResult: handleClickSearchResult
        }}  user={user} searchBar={{value: searchBarValue, handleChange: handleSearchBarChange}}
        createConversations={{setter: setCreateConversation, handler: handleCreateConversation}}
        animationClassname={animationClassName.receptionBox}
        footer={{
          onClickUserFriends: handleClickUserFriends, 
          handleClickMessageCircle: handleClickMessageCircle, 
          activeSection: activeSection 
        }}
      />}

      {conversations && activeSection === 2 ? (
          <Fragment>
              <Header onClickMenu={handleClickMenu}/>
              <SearchBar
                value={searchBarValue}
                onSearchBarChange={handleSearchBarChange}
              />
              {isSearchResultsAppear === true && <SearchResults clickResultHandler={handleClickSearchResult} results={[]}/>}
              <ListActiveFriends />
              <Footer
                onClickUserFriends={handleClickUserFriends}
                onClickMessageCircle={handleClickMessageCircle}
                active={activeSection}
              />
          </Fragment>
        ) : (
          ""
        )}
      {createConversation && <UserConversation animation={{
        className: animationClassName.conversation, 
        set: setAnimationClassName
        }} setCreateConversation={setCreateConversation} create={true} user={user}
        setBackwarded={setBackwared}
      />}
      
      { <Menu className={classnameForAnimation}/> }

      </SocketContext.Provider>
    </div>
  )
}

export const getServerSideProps = withSessionSsr(async function getServerSideProps({req,res}){
  const response = NextResponse.next()
  const authCookie = response.cookies.get('auth')
  
  let errorMessage: string = ""
  let loggedIn: boolean = false

  const urlForAuth = req.url === "/login" || req.url === "/register"
  let user = req.session.user
  
  if(!urlForAuth && !user){
      loggedIn = false

      if(authCookie){
        try {
          const auth = new Auth(req as NextApiRequest, res as NextApiResponse)
          const remembered = await auth.remembered(authCookie.value)
          if(remembered.ok){
            loggedIn = true
            user = remembered.user
          }
        }catch(e){
          const err = e as Error
          errorMessage = err.message
        }
      }
  }else {
    loggedIn = true
  }

  if(loggedIn === false){
    return {
      redirect: {
        permanent: false,
        destination: "/login",
        basePath: false
      }
    }
  }
  
  return {
    props: {
      user: user,
      errorMessage: errorMessage
    }
  }
})
