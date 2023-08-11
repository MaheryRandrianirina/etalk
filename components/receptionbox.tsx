import {  ChangeEventHandler, Dispatch, Fragment, MouseEvent, MouseEventHandler, SetStateAction, SyntheticEvent, TransitionEvent, TransitionEventHandler, useEffect, useLayoutEffect, useState } from "react"
import Opening from "./loaders/opening"
import ListConversations from "./conversations/listConversations"
import Header from "./app/header"
import SearchBar from "./app/searchBar"
import Footer from "./app/footer"
import SearchResults from "./app/searchResults"
import { User } from "../types/user"
import style from "../styles/sass/modules/conversations.module.scss"
import { CreateConversationButton } from "./widgets/button"
import { ButtonContext } from "./contexts/ButtonContext"
import { SearchResultHandler } from "../types/input"
import { UserConversations } from "../types/conversation"



export default function ReceptionBox({
  user,
  conversations,
  searchResults,
  searchBar,
  createConversations,
  animationClassname,
  footer,
  backwarded,
  setBackwarded,
  onClickMenu
}: {
  user: User;
  conversations: UserConversations;
  searchResults: {
    appear: boolean;
    handleClickSearchResult: SearchResultHandler;
  };
  searchBar: {
    value: string;
    handleChange: ChangeEventHandler<HTMLInputElement>;
  };
  createConversations: {
    setter: Dispatch<SetStateAction<boolean>>;
    handler: MouseEventHandler<HTMLButtonElement>;
  };
  animationClassname: string;
  footer: {
    onClickUserFriends: MouseEventHandler<SVGElement>;
    handleClickMessageCircle: MouseEventHandler<SVGElement>;
    activeSection: number;
  };
  backwarded: boolean;
  setBackwarded: Dispatch<SetStateAction<boolean>>;
  onClickMenu: MouseEventHandler<HTMLDivElement>
}): JSX.Element {

  useEffect(() => {
    const receptionBox = document.querySelector(
      ".reception_box"
    ) as HTMLDivElement;
    receptionBox.offsetWidth;
    
    if (backwarded) {
      setBackwarded(false);
    }
  }, []);

  const handleTransitionend: TransitionEventHandler<HTMLDivElement> = (
    e: TransitionEvent
  ) => {
    if (animationClassname.length > 0) {
      createConversations.setter(true);
    }
  };

  return (
    <div
      className={
        "reception_box " +
        (animationClassname.length > 0
          ? animationClassname
          : backwarded
          ? "flip"
          : "")
      }
      onTransitionEnd={handleTransitionend}
    >
      <Fragment>
        <Header onClickMenu={onClickMenu}/>
        <SearchBar
          value={searchBar.value}
          onSearchBarChange={searchBar.handleChange}
        />

        {searchResults.appear && (
          <SearchResults
            clickResultHandler={searchResults.handleClickSearchResult}
            results={[]}
          />
        )}

        {conversations && conversations.length > 0 ? (
          <ListConversations user={user} conversations={conversations} />
        ) : (
          <div className={style.empty_conversations}>
            Vous n&apos; avez aucune conversation. Veuillez en créer.
          </div>
        )}

        <ButtonContext.Provider value={createConversations.handler}>
          <CreateConversationButton />
        </ButtonContext.Provider>

        <Footer
          onClickUserFriends={footer.onClickUserFriends}
          onClickMessageCircle={footer.handleClickMessageCircle}
          active={footer.activeSection}
        />
      </Fragment>
    </div>
  );
}

