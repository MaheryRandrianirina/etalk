import ProfilePic from "../profilePic";
import profilePic from "../../public/20200823_120127_0.jpg"
import { AddReceiverInput } from "../form/input";
import { ChangeEvent, ChangeEventHandler, Dispatch, MouseEvent, MouseEventHandler, SetStateAction, StyleHTMLAttributes, SyntheticEvent, useEffect, useState } from "react";
import axios from "axios";
import { User } from "../../types/user";
import SearchResults from "../app/searchResults";
import { GetAway } from "../../types/utils";
import { ChosenReceivers } from "./chosenReceivers";
import { ChosenReceiver, Receiver, SearchResultStyle } from "../../types/conversation";

export default function ConversationHeader({addReceiver, user, chosenReceivers, 
        setChosenReceivers, handleBackward
}: {
    addReceiver?: true,
    user: User,
    chosenReceivers: ChosenReceiver[],
    setChosenReceivers: Dispatch<SetStateAction<ChosenReceiver[]>>,
    handleBackward: MouseEventHandler<SVGElement>
}): JSX.Element {
    const [receiver, setReceiver] : [
        receiver: string,
        setReceiver: Dispatch<SetStateAction<string>>
    ] = useState("")

    const [foundReceivers, setFoundReceivers]: [
        foundReceivers: Receiver[],
        setFoundReceivers: Dispatch<SetStateAction<Receiver[]>>
    ] = useState([] as Receiver[])

    const [searchResultStyle, setSearchResultStyle]: [
        searchResultStyle: SearchResultStyle, 
        setSearchResultStyle: Dispatch<SetStateAction<SearchResultStyle>>
    ] = useState({left : "", width: ""})

    const handleChangeReceiverInput: ChangeEventHandler<HTMLInputElement> = (e: ChangeEvent<HTMLInputElement>) => {
        setReceiver(e.target.value)
    }

    const handleCloseChosenReceiver: MouseEventHandler<SVGElement> = (e: SyntheticEvent)=>{
        const target = e.currentTarget as SVGElement

        setChosenReceivers(r => {
            return r.filter((value, index)=>{
                return value.username !== target.previousElementSibling?.textContent
            })
        })
    }

    const [chosenReceiversStyle, setChosenReceiversStyle]: [
        chosenReceiversStyle: {left: string}, 
        setChosenReceiversStyle: Dispatch<SetStateAction<{left: string}>>
    ] = useState({left: ""})

    useEffect(()=>{
        const searchInput = document.querySelector('.search_input') as HTMLInputElement
        setSearchResultStyle({
            left: `${searchInput.offsetLeft}px`, 
            width : `${searchInput.offsetWidth}px`
        })

        if(receiver.length > 2){
            searchReceiver(receiver).then(users => {
                setFoundReceivers(users)
            }).catch(err => {
                console.error(err)
            })
        }
    }, [receiver])

    const searchReceiver: (receiver: string) => Promise<GetAway<User, ["password"]>[]> = async (receiver) => {
        try {
            const res = await axios.get(`/api/user?name=${receiver}`)
            if(res.statusText === 'OK'){
                const users = res.data.users as Receiver[]

                const searchedUsers = users.filter((value, index)=>{
                    let chosenReceiversUsername: string[] = []

                    chosenReceivers.forEach(chosenReceiver => {
                        chosenReceiversUsername.push(chosenReceiver.username)
                    })
                    
                    return value.username !== user.username && chosenReceiversUsername.includes(value.username) === false
                })

                return searchedUsers
            }else {
                throw Error("Il y a eu une erreur")
            }
        }catch(e){
            throw e
        }
    }

    const handleChooseReceiver = (e: SyntheticEvent, receiver: ChosenReceiver) => {
        setChosenReceivers(r => {
            return [...r, receiver]
        })

        const searchInput = document.querySelector('.search_input') as HTMLInputElement
        
        setChosenReceiversStyle(crs => {
            return {left: crs.left === "" ? (searchInput.offsetLeft + 30 + 'px') : crs.left}
        })

        reinitializeReceiverValue(searchInput)
    }

    const reinitializeReceiverValue = (searchInput: HTMLInputElement)=>{
        searchInput.value = ""
        setReceiver("")
    }

    const showResults = foundReceivers.length > 0 && receiver.length > 2

    return <div className="conversation_header">
        <svg onClick={handleBackward} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="go_back_button">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        {addReceiver === undefined ? <div className="adressee">
            <p className="username">{user.id}</p>
            <p className="status_online"></p>
            <ProfilePic imagePath={profilePic}/>
        </div> : <AddReceiverInput onChangeInput={handleChangeReceiverInput}/>}
        {chosenReceivers.length > 0 && <ChosenReceivers onClickX={handleCloseChosenReceiver} style={chosenReceiversStyle} receivers={chosenReceivers}/>}
        {(showResults) && 
            <SearchResults choseReceiver={true} clickResultHandler={handleChooseReceiver} results={foundReceivers} className="receivers" style={searchResultStyle}/>
        }
    </div>
}