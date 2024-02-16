import ProfilePic from "../profilePic";
import profilePic from "../../public/20200823_120127_0.jpg";
import { AddReceiverInput } from "../form/input";
import {
  ChangeEvent,
  ChangeEventHandler,
  Dispatch,
  MouseEvent,
  MouseEventHandler,
  SetStateAction,
  SyntheticEvent,
  TransitionEvent,
  TransitionEventHandler,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { AuthUser, User } from "../../types/user";
import SearchResults from "../app/searchResults";
import { GetAway, MultipleClassnameForAnimation } from "../../types/utils";
import { ChosenReceivers } from "./chosenReceivers";
import {
  ChosenReceiver,
  Receiver,
  SearchResultStyle,
} from "../../types/conversation";
import { UserIcon } from "../icons/UserIcon";
import Profile from "../user/profile";
import { createPortal } from "react-dom";
import { ButtonContext } from "../contexts/ButtonContext";
import ConfirmationModal from "../modals/confirmationModal";
import { BlockUser } from "../../pages/conversation/[adressee_id]/[conversation_id]";
import { Join } from "../../types/Database";
import BackIcon from "../icons/backIcon";
import { ModalData } from "../../types/modal";

const ConversationHeader = ({
  addReceiver,
  adressee,
  user,
  chosenReceivers,
  setChosenReceivers,
  handleBackward,
  blockUser
}: {
  addReceiver?: true;
  user: AuthUser;
  adressee?: Join<Join<AuthUser, {blocked: boolean}>, {blocked: boolean}>;
  chosenReceivers: ChosenReceiver[];
  setChosenReceivers: Dispatch<SetStateAction<ChosenReceiver[]>>;
  handleBackward: MouseEventHandler<SVGElement>;
  blockUser: {
    state: BlockUser,
    set: Dispatch<SetStateAction<BlockUser>>
  }
}): JSX.Element => {

  const [receiver, setReceiver]: [
    receiver: string,
    setReceiver: Dispatch<SetStateAction<string>>
  ] = useState("");

  const [foundReceivers, setFoundReceivers]: [
    foundReceivers: Receiver[],
    setFoundReceivers: Dispatch<SetStateAction<Receiver[]>>
  ] = useState([] as Receiver[]);

  const [searchResultStyle, setSearchResultStyle]: [
    searchResultStyle: SearchResultStyle,
    setSearchResultStyle: Dispatch<SetStateAction<SearchResultStyle>>
  ] = useState({ left: "", width: "" });

  const [showAdresseeProfile, toggleAdresseeProfile]: [
    showAdresseeProfile: boolean,
    toggleAdresseeProfile: Dispatch<SetStateAction<boolean>>
  ] = useState(false);

  const [modal, setModal]: [
    modal: ModalData<"confirmation">,
    setModal: Dispatch<SetStateAction<ModalData<"confirmation">>>
  ] = useState({show: false, type: "confirmation", data: ""} as ModalData<"confirmation">)

  const handleChangeReceiverInput: ChangeEventHandler<HTMLInputElement> = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setReceiver(e.target.value);
  };

  const handleCloseChosenReceiver: MouseEventHandler<SVGElement> = (
    e: SyntheticEvent
  ) => {
    const target = e.currentTarget as SVGElement;

    setChosenReceivers((r) => {
      return r.filter((value, index) => {
        return value.username !== target.previousElementSibling?.textContent;
      });
    });
  };

  const [chosenReceiversStyle, setChosenReceiversStyle]: [
    chosenReceiversStyle: { left: string },
    setChosenReceiversStyle: Dispatch<SetStateAction<{ left: string }>>
  ] = useState({ left: "" });

  const  [classnameForAnimation, setClassnameForAnimation]: [
    classnameForAnimation: MultipleClassnameForAnimation<["profile", "modal"]>, 
    setClassnameForAnimation: Dispatch<SetStateAction<MultipleClassnameForAnimation<["profile", "modal"]>>>
  ] = useState({
    profile: "",
    modal: ""
  } as MultipleClassnameForAnimation<["profile", "modal"]>);

  const resetProfileClassnameForAnimation = useCallback(()=>{
    setClassnameForAnimation(c => {
      return {...c, profile: ""}
    });
  }, [])

  const handleBodyClick = useCallback(()=>{
    document.body.addEventListener('click', (e) => {
      e.preventDefault()

      if (classnameForAnimation.profile.length > 0) {
        resetProfileClassnameForAnimation()
      }
    })
  }, [classnameForAnimation, resetProfileClassnameForAnimation])

  const searchReceiver: (
    receiver: string, 
    sender_id: number
  ) => Promise<GetAway<User, ["password"]>[]> = useCallback(async (receiver, sender_id) => {
    try {
      const res = await axios.get(`/api/user?name=${receiver}&sender_id=${sender_id}`);
      if (res.statusText === "OK") {
        const users = res.data.users as Receiver[];
        
        const searchedUsers = users.filter((userValue) => {
          let chosenReceiversUsername: string[] = [];

          chosenReceivers.forEach((chosenReceiver) => {
            chosenReceiversUsername.push(chosenReceiver.username);
          });
          
          return (
            userValue.username !== user.username || userValue.name !== user.name
          );
        });

        return searchedUsers;
      } else {
        throw Error("Il y a eu une erreur");
      }
    } catch (e) {
      throw e;
    }
  }, [chosenReceivers, user]);

  useEffect(() => {
    const searchInput = document.querySelector(
      ".search_input"
    ) as HTMLInputElement;
    
    if (addReceiver) {
      setSearchResultStyle({
        left: `${searchInput.offsetLeft}px`,
        width: `${searchInput.offsetWidth}px`,
      });

      if (receiver.length > 2) {
        searchReceiver(receiver, user.id)
          .then((users) => {
            setFoundReceivers(users);
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }

    handleBodyClick()    
  }, [
    receiver, 
    showAdresseeProfile, 
    classnameForAnimation,
    addReceiver,
    searchReceiver,
    user,
    handleBodyClick
  ]);

  const handleChooseReceiver = (
    e: SyntheticEvent,
    receiver: ChosenReceiver
  ) => {

    setChosenReceivers((r) => {
      return [...r, receiver];
    });

    const searchInput = document.querySelector(
      ".search_input"
    ) as HTMLInputElement;

    setChosenReceiversStyle((crs) => {
      return {
        left: crs.left === "" ? searchInput.offsetLeft + 30 + "px" : crs.left,
      };
    });

    reinitializeReceiverValue(searchInput);
  };

  const reinitializeReceiverValue = (searchInput: HTMLInputElement) => {
    searchInput.value = "";
    setReceiver("");
  };

  const handleToggleAdresseProfile: MouseEventHandler<HTMLDivElement> = (
    e: SyntheticEvent
  ) => {
    e.preventDefault();
    e.stopPropagation()
    
    if (!showAdresseeProfile) {
      toggleAdresseeProfile(true);

      setClassnameForAnimation(c => {
        return {...c, profile: "visible"}
      });
    } else {
      resetProfileClassnameForAnimation()
    }
  };

  const handleAdresseeProfileTransitionend: TransitionEventHandler<HTMLDivElement> =
    (e: TransitionEvent) => {
      e.preventDefault();
       
      const adresseeProfileIsSetToDisappear =
        showAdresseeProfile && classnameForAnimation.profile.length === 0;
      if (adresseeProfileIsSetToDisappear) {
        toggleAdresseeProfile(false);
      }
    };

  const handleClickCloseButton: MouseEventHandler<SVGElement> = (
    e: MouseEvent
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (showAdresseeProfile) {
      resetProfileClassnameForAnimation()
    }else if(modal.show){
      resetModalClassnameForAnimation()
    }
  };

  const resetModalClassnameForAnimation = useCallback(()=>{
    setClassnameForAnimation(c => {
      return {...c, modal: ""}
    })
  }, [setClassnameForAnimation])

  const handleClickBlockUntoggleBlockUserButton: MouseEventHandler<HTMLButtonElement> = async(e:MouseEvent) => {
    if(!adressee?.blocked){
      setModal({
        show: true, 
        type: "confirmation", 
        data: `Vous vous apprêtez à bloquer ${adressee?.username}. \n Etes-vous sûr de poursuivre ?`
      });

      setClassnameForAnimation(c => {
        return {...c, modal: "visible"}
      });
    }else {
      const unblocked = await toggleBlockUser()
      if(unblocked){
        resetProfileClassnameForAnimation()
      }
    }
  }

  const handleModalTransitionend: TransitionEventHandler<HTMLDivElement> = (e: TransitionEvent) => {
    e.preventDefault();
    
    if(showAdresseeProfile && 
      classnameForAnimation.profile.length > 0
    ){
      resetProfileClassnameForAnimation();
    }else if(modal.show) {
      setModal(m => {
        return {...m, show: false}
      })
    }
  }

  const toggleBlockUser = useCallback(async()=>{
    try {
      const res = await axios.post("/api/user/block", {adressee_id: adressee?.id})
      if(res.statusText === "OK"){
        blockUser.set(bu => {
          return {...bu, success: res.data.success}
        })

        return true
      }
    }catch(e){
      blockUser.set(bu => {
        return {...bu, error: e as Error}
      })
    }
  }, [adressee, blockUser])

  const handleClickModalButtons: MouseEventHandler<HTMLButtonElement> = useCallback(async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation()
    
    switch(modal.type) {
      case "confirmation":
        if(e.currentTarget.classList.contains('ok')){
          const success = await toggleBlockUser()
          if(success){
            resetModalClassnameForAnimation()
          }
        }else {
          resetModalClassnameForAnimation()
        }

        break
    }
  }, [modal, resetModalClassnameForAnimation, toggleBlockUser])

  const showResults = foundReceivers.length > 0 && receiver.length > 2;

  return (
    <div className="conversation_header" >
      <BackIcon onClickBack={handleBackward}/>

      {addReceiver === undefined ? (
        <div className="adressee" onClick={handleToggleAdresseProfile}>
          <p className="username">{adressee && adressee.username}</p>
          {adressee && !adressee.blocked && adressee.is_online ? (
            <p className="status_online"></p>
          ) : (
            adressee && adressee.blocked ? <p className='blocked_user'>Bloqué</p> : ""
          )}
          {adressee && adressee.image ? (
            <ProfilePic imagePath={profilePic} />
          ) : (
            <UserIcon />
          )}
        </div>
      ) : (
        <AddReceiverInput onChangeInput={handleChangeReceiverInput} />
      )}

      {chosenReceivers.length > 0 && (
        <ChosenReceivers
          onClickX={handleCloseChosenReceiver}
          style={chosenReceiversStyle}
          receivers={chosenReceivers}
        />
      )}

      {showResults && (
        <SearchResults
          choseReceiver={true}
          clickResultHandler={handleChooseReceiver}
          results={foundReceivers}
          className="receivers"
          style={searchResultStyle}
        />
      )}

      {showAdresseeProfile &&
        adressee &&
        createPortal(
            <ButtonContext.Provider value={handleClickBlockUntoggleBlockUserButton}>
              <Profile
                className={classnameForAnimation.profile}
                transitionendHandler={handleAdresseeProfileTransitionend}
                blockUserSuccess={blockUser.state.success}
                adressee={adressee}
                onClickCloseButton={handleClickCloseButton}
            />
            </ButtonContext.Provider>,
          document.querySelector("main") as HTMLElement
        )}

        {modal.show && (modal.type === "confirmation" ? 
          createPortal(
          <ButtonContext.Provider value={handleClickModalButtons}>
            <ConfirmationModal transitionendHandler={handleModalTransitionend} 
              className={classnameForAnimation.modal} data={modal.data}
              onClickCloseButton={handleClickCloseButton}
            />
          </ButtonContext.Provider>, 
          document.querySelector('main') as HTMLElement) : "")
        }
    </div>
  );
}

export default ConversationHeader