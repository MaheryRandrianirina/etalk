import { Dispatch, SetStateAction, useState } from "react";

type AblyApiState = [
    calledAblyApi: Boolean,
    setCalledAblyApi: Dispatch<SetStateAction<boolean>>
];

const useCallAblyApi = (): AblyApiState =>{
    const [calledAblyApi, setCalledAblyApi]: AblyApiState = useState(false);

    return [calledAblyApi, setCalledAblyApi];
}

export {
    useCallAblyApi
}