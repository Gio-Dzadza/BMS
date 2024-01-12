import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import FinancesList from "../../components/FinancesList";
import '../ListsParentStyles.css'

export default function Finances() {
    const[url, setUrl] = useState('http://localhost:3001/api/projapi/get/projects');// eslint-disable-line no-unused-vars
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [updateList, setUpdateList] = useState(false);
    const [showPage, setShowPage] = useState(false);
    const [permission, setPermission] = useState(false);

    const context = useAuthContext();
    
    useEffect(() => {
        if (formSubmitted) {
            setUrl((prevUrl) => prevUrl + "?timestamp=" + Date.now());
            setFormSubmitted(false); 
        };
    }, [formSubmitted]);

    useEffect(()=>{
        if(context.authIsReady){
            setShowPage(true);
            if(context.user.User_Type_id === 4){
                setPermission(true);
            } else{
                setPermission(false);
            };
        } else{
            setShowPage(false);
        };
    },[context]);

return (
    <div className="data-grid-parent">
        {
            showPage && (
                <>
                    {
                        permission && (
                            <FinancesList updateList = {updateList} setUpdateList = {setUpdateList} />
                        )
                    }
                </>
            )
        }
    </div>
)
}
