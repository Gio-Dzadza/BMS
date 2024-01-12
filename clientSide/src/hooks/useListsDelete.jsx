import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import Axios from 'axios';

export const useListsDelete = () => {
    const [data, setData]= useState(null);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);
    const context = useAuthContext();

    const deleteItem = async (id, tableName, mainList, setMainList) => {
        const controller = new AbortController();
        setIsPending(true);
        const tableData = {
            tableName: tableName
        };

        try {
            const response = await Axios.delete(`http://localhost:3001/api/adminapi/lists/delete/${id}`, { 
                signal: controller.signal,
                headers: {
                    "x-access-token": context.userToken,
                },
                data: tableData
            });

            if (response.data.auth) {
                console.log(id + ' ' + response.data);
            } else {
                console.log(id + ' ' + response.data.message);
            }

            if (response.data.deleted) {
                console.log(id + ' ' + response.data.message);
                const updatedList = mainList.filter((item) => item.id !== id);
                setMainList(updatedList);
            }

            setIsPending(false);
            setError(null);
        } catch (err) {
            if (err.name === "AbortError") {
                console.log("The fetch was aborted");
            } else {
                setIsPending(false);
                setError("Couldn't fetch the data");
                console.log(err.message);
            }
        }
        
        controller.abort();
    };

    return { data, isPending, error, deleteItem };
}
