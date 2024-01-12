import React, { useEffect, useState } from 'react';
//styles
import './Main.css'
//routes
import {Link} from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useFetch } from '../../hooks/useFetch';

//mui
import { ProSidebar, SidebarHeader, SidebarFooter, SidebarContent, Menu, MenuItem } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import { IconButton } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import HailIcon from '@mui/icons-material/Hail';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmailIcon from '@mui/icons-material/Email';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import DehazeIcon from '@mui/icons-material/Dehaze';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

export default function Main() {
  const context = useAuthContext();
  const [permission, setPermission] = useState(false);
  const [financialInfo, setFinancialInfo] = useState(false);
  const [bookerPermission, setBookerPermission] = useState(false);
  const [noId] = useState('noID');
  const [windowWidth, setWindowWidth] = useState('');
  const [collapse, setCollapse] = useState(false);
  const [expand, setExpand] = useState('');
  const [breakPoint, setBreakPoint] = useState(false);


  const {data: user} = useFetch('http://localhost:3001/api/getUser');

  const [userName, setUserName] = useState('');
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    const getWindowSize = () => {
      setWindowWidth(window.visualViewport.width);
    };
  
    getWindowSize(); 
  
    window.visualViewport.addEventListener('resize', getWindowSize);

    return () => {
      window.visualViewport.removeEventListener('resize', getWindowSize);
    };
  }, []);

  useEffect(() => {
    if (windowWidth < 768) {
      setCollapse(true);
      setExpand('expand-position');
      setBreakPoint(true);
    } else {
      setCollapse(false);
      setExpand('expand');
      setBreakPoint(false);
    }
  }, [windowWidth]);


  const handleSidebarExpand = ()=>{
    setBreakPoint(!breakPoint);
  };

  useEffect(() => {
      if(user && user.result && context.user){
          const currentUser = user && user.result.find((userItem) => userItem.id === context.user.id);
          setUserName(currentUser ? currentUser.FirstName : '');
          if(currentUser && currentUser.User_Image){
              setImgSrc(`http://localhost:3001/uploads/users/${currentUser.id}/${currentUser.User_Image}`);
          } else {
              setImgSrc(null);
          };
      };
  }, [context, user]);

  useEffect(()=>{
      if( context.user && context.user.User_Type_id === 1 ){
          setPermission(true);
          setBookerPermission(true);
          setFinancialInfo(false);
      } else if(context.user && context.user.User_Type_id === 4){
          setPermission(true);
          setBookerPermission(true);
          setFinancialInfo(true);
      } else if(context.user && context.user.User_Type_id === 5){
          setBookerPermission(false);
          setFinancialInfo(false);
      } else{
          setPermission(false);
          setBookerPermission(true);
          setFinancialInfo(false);
      };
  },[context]);

  return (
    <>
      {
        context.user && (
          <>
              <div className={expand} onClick={handleSidebarExpand}>
                <DehazeIcon />
              </div>
              <div className='sidebar'>
                <ProSidebar collapsed={collapse} collapsedWidth='52px' breakPoint={breakPoint? 'sm' : ''} className='pro-sedebar'>
                  <div className='sidebarHeader'> 
                    <SidebarHeader>
                      <div className='logo'>
                        <Link to="/" style={{fontSize:"36px", textDecoration:"none", color:"black", lineHeight:"100px", fontWeight:"bold"}}>
                          YOUR LOGO
                          </Link>
                        {
                          collapse ? (
                            <h5 className='user-name'>{userName}</h5>
                          ) : (
                            <h1 className='user-name'>{userName}</h1>
                          )
                        }
                        {
                            imgSrc ? (
                                <div style={!collapse ? 
                                {width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden'} 
                                : {width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden'}
                                }>
                                  <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src={imgSrc} alt='User Profile' />
                                </div>
                            ) : (
                                <h1>No User Image</h1>
                            )
                        }
                      </div>
                    </SidebarHeader>
                  </div>
                  <SidebarContent>
                    <Menu iconShape="square">
                      {permission && (
                        <MenuItem>
                          <Link to='/users'>
                            <GroupIcon />
                            <IconButton 
                              sx={{ 
                                fontSize: '18px', 
                                fontWeight: 'bold',
                                '&:hover': {
                                  backgroundColor: 'transparent',
                                }, 
                              }}
                            >
                              თანამშრომლები
                            </IconButton>
                          </Link>
                        </MenuItem>
                      )}
                      { permission && (
                        <MenuItem>
                          <Link to='/clients'>
                            <HailIcon />
                            <IconButton 
                              sx={{ 
                                fontSize: '18px', 
                                fontWeight: 'bold',
                                '&:hover': {
                                  backgroundColor: 'transparent', 
                                }, 
                              }}
                            >
                              კლიენტები
                            </IconButton>
                          </Link>
                        </MenuItem>
                      )}
                      {context.user.User_Type_id === 2 ? (
                        <MenuItem>
                          <Link to={`/userProjects/${context.user.id}`}>
                            <ArchitectureIcon />
                            <IconButton 
                              sx={{ 
                                fontSize: '18px', 
                                fontWeight: 'bold',
                                '&:hover': {
                                  backgroundColor: 'transparent', 
                                }, 
                              }}
                            >
                              პროექტები
                            </IconButton>
                          </Link>
                        </MenuItem>
                      ) : (
                        <MenuItem>
                          <Link to={'/projects/' + noId}>
                            <ArchitectureIcon />
                            <IconButton 
                              sx={{ 
                                fontSize: '18px', 
                                fontWeight: 'bold',
                                '&:hover': {
                                  backgroundColor: 'transparent',
                                }, 
                              }}
                            >
                              პროექტები
                            </IconButton>
                          </Link>
                        </MenuItem>
                      )}
                      <MenuItem>
                        <Link to='/stat'>
                          <LeaderboardIcon />
                          <IconButton 
                            sx={{ 
                              fontSize: '18px', 
                              fontWeight: 'bold',
                              '&:hover': {
                                backgroundColor: 'transparent', 
                              }, 
                            }}
                          >
                            სტატისტიკა
                          </IconButton>
                        </Link>
                      </MenuItem>
                      {
                        bookerPermission && (
                          <>
                            <MenuItem>
                              <Link to='/notifications'>
                                <EmailIcon />
                                <IconButton 
                                  sx={{ 
                                    fontSize: '18px', 
                                    fontWeight: 'bold',
                                    '&:hover': {
                                      backgroundColor: 'transparent',
                                    }, 
                                  }}
                                >
                                  შეტყობინებები
                                </IconButton>
                              </Link>
                            </MenuItem>
                          </>
                        )
                      }
                      {permission && (
                        <MenuItem>
                          <Link to='/manageLists'>
                            <FactCheckIcon />
                            <IconButton 
                              sx={{ 
                                fontSize: '18px', 
                                fontWeight: 'bold',
                                '&:hover': {
                                  backgroundColor: 'transparent', 
                                }, 
                              }}
                            >
                              სიების მართვა
                            </IconButton>
                          </Link>
                        </MenuItem>
                      )}
                      {financialInfo && (
                        <MenuItem>
                          <Link to='/finances'>
                            <MonetizationOnIcon />
                            <IconButton 
                              sx={{ 
                                fontSize: '18px', 
                                fontWeight: 'bold',
                                '&:hover': {
                                  backgroundColor: 'transparent',
                                }, 
                              }}
                            >
                              ფინანსები
                            </IconButton>
                          </Link>
                        </MenuItem>
                      )}
                    </Menu>
                  </SidebarContent>
                  <SidebarFooter>
                  </SidebarFooter>
                </ProSidebar>
              </div>
          </>
        )
      }
    </>
  )
}
