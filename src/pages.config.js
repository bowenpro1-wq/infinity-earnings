import Landing from './pages/Landing';
import Home from './pages/Home';
import MyLinks from './pages/MyLinks';
import ShortenNew from './pages/ShortenNew';
import Withdraw from './pages/Withdraw';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';
import RequestAd from './pages/RequestAd';
import Help from './pages/Help';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import Verification from './pages/Verification';


export const PAGES = {
    "Landing": Landing,
    "Home": Home,
    "MyLinks": MyLinks,
    "ShortenNew": ShortenNew,
    "Withdraw": Withdraw,
    "Settings": Settings,
    "Statistics": Statistics,
    "RequestAd": RequestAd,
    "Help": Help,
    "AdminLogin": AdminLogin,
    "AdminPanel": AdminPanel,
    "Verification": Verification,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
};