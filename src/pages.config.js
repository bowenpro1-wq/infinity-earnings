/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import GoPro from './pages/GoPro';
import Help from './pages/Help';
import Home from './pages/Home';
import Landing from './pages/Landing';
import MyLinks from './pages/MyLinks';
import Redirect from './pages/Redirect';
import RequestAd from './pages/RequestAd';
import Settings from './pages/Settings';
import ShortenNew from './pages/ShortenNew';
import Statistics from './pages/Statistics';
import V from './pages/V';
import Verification from './pages/Verification';
import Withdraw from './pages/Withdraw';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminLogin": AdminLogin,
    "AdminPanel": AdminPanel,
    "GoPro": GoPro,
    "Help": Help,
    "Home": Home,
    "Landing": Landing,
    "MyLinks": MyLinks,
    "Redirect": Redirect,
    "RequestAd": RequestAd,
    "Settings": Settings,
    "ShortenNew": ShortenNew,
    "Statistics": Statistics,
    "V": V,
    "Verification": Verification,
    "Withdraw": Withdraw,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};