import Landing from './pages/Landing';
import Home from './pages/Home';
import MyLinks from './pages/MyLinks';
import ShortenNew from './pages/ShortenNew';
import Withdraw from './pages/Withdraw';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';
import Help from './pages/Help';
import RequestAd from './pages/RequestAd';
import AdminPanel from './pages/AdminPanel';
import Redirect from './pages/Redirect';


export const PAGES = {
    "Landing": Landing,
    "Home": Home,
    "MyLinks": MyLinks,
    "ShortenNew": ShortenNew,
    "Withdraw": Withdraw,
    "Settings": Settings,
    "Statistics": Statistics,
    "Help": Help,
    "RequestAd": RequestAd,
    "AdminPanel": AdminPanel,
    "Redirect": Redirect,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
};