import { useEffect, useState } from "react"


export const useOrigin = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(()=>{
        setIsMounted(true)
    },[])

    if(!isMounted){
        return null
    }

    return window.location.origin
}