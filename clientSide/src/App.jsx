//react-router
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';

//styles
import './App.css';
//pages and components
import Nav from './components/Nav';
import Login from './pages/login/Login';
import Main from './pages/main/Main';
import Users from './pages/users/Users';
import { useAuthContext } from './hooks/useAuthContext';
import Statistics from './pages/statistics/Statistics';
import UserStat from './pages/statistics/UserStat';
import ProjectStat from './pages/statistics/ProjectStat';
import Clients from './pages/clients/Clients';
import Projects from './pages/projects/Projects';
import UserEdit from './pages/userSettings/UserEdit';
import ListsManager from './pages/manage/ListsManager';
import Notifications from './pages/notificationPage/Notifications';
import Blank from './pages/blank/Blank';
import Finances from './pages/finances/Finances';

function App() {
  const context = useAuthContext();
  return (
    <div className="App">
      <Router>
        <Main />
        <Routes className="Routes">
          <Route 
            exact path='/' 
            element={!context.authIsReady ? <Navigate to='/logini' /> : <Blank /> } 
          />
          <Route exact path='/logini' element={context.authIsReady ? <Navigate to='/' /> : <Login /> } />
          <Route exact path='/users' element={<Users /> } />
          <Route path='/clients' element={<Clients />} />
          <Route path='/projects/:id' element={<Projects />} />
          <Route path='/userProjects/:uid' element={<Projects />} />
          <Route path='/stat' element={<Statistics />} />
          <Route path='/usersStat' element={<UserStat />} />
          <Route path='/projectsStat' element={<ProjectStat />} />
          <Route path='/userEdit' element={<UserEdit />} />
          <Route path='/manageLists' element={<ListsManager />} />
          <Route path='/notifications' element={<Notifications />} />
          <Route path='/finances' element={<Finances />} />
        </Routes>
        <Nav />
      </Router>
    </div>
  );
}

export default App;
