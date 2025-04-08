import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useState } from "react";


const useCallAblyApi = (): boolean =>{
    const [calledAblyApi, setCalledAblyApi] = useState(false);

    useEffect(()=> {
        axios.get("/api/ably").then(res => setCalledAblyApi(true)).catch(err => console.error(err));
    },[])

    return calledAblyApi;
}

export {
    useCallAblyApi
}