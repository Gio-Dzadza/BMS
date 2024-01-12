import { useState, useEffect } from "react";
import UsersList from "../../components/UsersList";
import UserRegisterForm from "../../components/UserRegisterForm";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Button } from '@mui/material';
import '../ListsParentStyles.css';

export default function Users() {
    const[url, setUrl] = useState('http://localhost:3001/api/get');// eslint-disable-line no-unused-vars
    const[showRegForm, setShowRegForm] = useState(false);
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
            if(context.user.User_Type_id === 1){
                setPermission(true);
                setShowPage(true);
            } else if(context.user.User_Type_id === 4){
                setPermission(true);
                setShowPage(true);
            } else{
                setPermission(false);
            };
        } else{
            setShowPage(false);
        };
    },[context]);

    const showForm = ()=>{
        setShowRegForm(true);
    }

    const handleFormSubmit = () => {
        setFormSubmitted(true);
        setUpdateList(true);
        setShowRegForm(false);
    };

return (
    <div className="data-grid-parent">
        {
            showPage && (
                <>
                    {
                        permission && (
                            <div className='grid-parent-add-btn-container'>
                                <Button className='grid-parent-add-btn' onClick={showForm}>მომხმარებლის დამატება</Button>
                            </div>
                        )
                    }
                    { showRegForm && (
                        <div className={ showRegForm ? 'modal-window-show' : 'modal-window' }>
                            <UserRegisterForm className='modal-content' setShowRegForm={setShowRegForm} handleFormSubmit={handleFormSubmit} /> 
                        </div>
                    ) 
                    }
                    <UsersList updateList = {updateList} setUpdateList = {setUpdateList} />
                </>
            ) 
        }
    </div>
)
}
