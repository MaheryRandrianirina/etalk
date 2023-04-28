import { ChangeEvent, ChangeEventHandler, EventHandler, Fragment, SyntheticEvent, useEffect, useState } from "react"
import Opening from "./loaders/opening"
import Login from "./login"
import ListConversations from "./conversations/listConversations"
import Header from "./app/header"
import SearchBar from "./app/searchBar"
import Footer from "./app/footer"
import ListActiveFriends from "./friends/listActiveFriends"
import SearchResults from "./app/searchResults"


export default function ReceptionBox(): JSX.Element {
    const [loading, setLoading]: [loading: boolean, setLoading: Function] =
      useState(true);

    const [activeSection, setActiveSection]: [
      activeSection: number,
      setActiveSection: Function
    ] = useState(1);

    const [searchBarValue, setSearchBarValue]: [
      searchBarValue: string,
      setSearchBarValue: Function
    ] = useState("");

    const [isSearchResultsAppear, setSearchResultsAppear]: [
      isSearchResultsAppear: boolean,
      setSearchResultsAppear: Function
    ] = useState(false);

    const session = "dzaed"

    
    useEffect(()=>{
        setTimeout(()=>{
            setLoading(false)
        }, 5000)
    }, [loading])

    
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

    return (
      <div className="reception_box">
        {loading && <Opening />}
        {loading === false && session === null ? <Login /> : ""}
        {loading === false && session !== null && activeSection === 1 ? (
          <Fragment>
            <Header />
            <SearchBar
              value={searchBarValue}
              onSearchBarChange={handleSearchBarChange}
            />
            {isSearchResultsAppear === true && <SearchResults />}
            <ListConversations />
            <Footer
              onClickUserFriends={handleClickUserFriends}
              onClickMessageCircle={handleClickMessageCircle}
              active={activeSection}
            />
          </Fragment>
        ) : (
          ""
        )}

        {loading === false && session !== null && activeSection === 2 ? (
          <Fragment>
            <Header />
            <SearchBar
              value={searchBarValue}
              onSearchBarChange={handleSearchBarChange}
            />
            {isSearchResultsAppear === true && <SearchResults />}
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
      </div>
    );
}

