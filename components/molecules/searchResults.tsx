import React, { Dispatch, SetStateAction, SyntheticEvent, useCallback, useEffect, useState } from "react";
import { User } from "../../types/user";
import { GetAway } from "../../types/utils";
import SearchResult from "../atoms/searchResult";
import { SearchResultHandler } from "../../types/input";

type SearchResultsType = GetAway<User, ["password"]>[]

type ResultsToShow = {
    lastIndex: number,
    showed: SearchResultsType
}

const SearchResults = React.memo(function SearchResults({results, className, style, clickResultHandler, choseReceiver}: {
    results: SearchResultsType,
    className?: string,
    style?: {left: string, width: string},
    clickResultHandler: SearchResultHandler, 
    choseReceiver?: true 
}): JSX.Element {
    const [resultsToShow, setResultsToshow]: [
        resultsToShow: ResultsToShow, 
        setResultsToshow: Dispatch<SetStateAction<ResultsToShow>>
    ] = useState({lastIndex:0, showed: []} as ResultsToShow)
    
    useEffect(()=>{
        let resToShow: SearchResultsType = []
        let lastIndex = 9

        if(results.length >= 10){
            resToShow = results.slice(0, 9)

            setResultsToshow(r => {
                return {
                    lastIndex: r.lastIndex + lastIndex,
                    showed: [...r.showed, ...resToShow]
                }
            })
        }else {
            resToShow = results
            lastIndex = results.length

            setResultsToshow({
                lastIndex: lastIndex,
                showed: resToShow
            })
        }
        
        
    }, [results])
    
    return <div className={"search_results " + (className ? className : "")} style={(style && (style.left.length > 2 && style.width.length > 2)) ? style : undefined}>
        {resultsToShow.showed.length > 0 && resultsToShow.showed.map(user => {
            return <SearchResult choseReceiver={choseReceiver} clickResultHandler={clickResultHandler} key={user.id} user={user}/>
        })}
    </div>
})

export default SearchResults
