import { useEffect, useState } from "react"
import { useAuthContext } from "./useAuthContext";

export const useFetch = (url)=>{
    const [data, setData]= useState(null);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);
    const context = useAuthContext();
    

    useEffect(()=>{
        const controller = new AbortController();

        const fetchData = async()=>{
            setIsPending(true);
            try{
                const response = await fetch(url, {signal: controller.signal, 
                    headers:{"x-access-token": context.userToken,}});
                if(!response.ok){
                    throw new Error(response.statusText);
                }
                const json = await response.json();

                if (!controller.signal.aborted) {
                    setIsPending(false);
                    setData(json);
                    setError(null);
                }
            } catch(err){
                if(err.name === "AbortError"){
                    console.log("The fetch was aborted");
                }else{
                    setIsPending(false);
                    setError("Couldn't fetch the data");
                    console.log(err.message);
                }
            }
        };
        fetchData();
        return ()=>{
            controller.abort();
        }
    },[url, context])

    return{data, isPending, error}
}