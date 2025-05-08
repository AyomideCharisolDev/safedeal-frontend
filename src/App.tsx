import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Navigate,
  createRoutesFromElements,
} from "react-router-dom";
import NotFound from "./notfound";
import SignUp from "./pages/signUp/signup";
import EscrowLandingPage from "./pages/home/page";
import Dashbaord from "./pages/dashboard/page";
import LoginPage from "./pages/login/login";
import CreateLink from "./pages/dashboard/createEscrow/createPage";
import EscrowsPage from "./pages/dashboard/ManageDeals/EscrowsPage";
import Settings from "./pages/dashboard/settings/settingsPage";
import DealDetails from "./pages/dashboard/ManageDeals/dealsDetails";
import MakePayment from "./pages/dashboard/payment/makepayment";

const App = () => {
  const token = localStorage.getItem("sol_escrow");
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/"  >
           <Route path="/" element={token? <EscrowLandingPage/> : <Navigate to='/dashboard'/>} />
           <Route path="/signup" element={<SignUp/>} />
           <Route path="/login" element={!token?  <LoginPage/> : <Navigate to='/dashboard'/>} />
           <Route path="/dashboard/escrows" element={token? <EscrowsPage/> : <Navigate to='/login'/>} />
           <Route path="/dashboard/create" element={token? <CreateLink/> : <Navigate to='/login'/>} />
           <Route path="/dashboard/deals/:dealId" element={token? <DealDetails/> : <Navigate to='/login'/>} />
           <Route path="/dashboard" element={token?  <Dashbaord/>  : <Navigate to='/login'/>} />
           <Route path="/dashboard/settings" element={token?  <Settings/>  : <Navigate to='/login'/>} />
           <Route path="*" element={<NotFound/>} />
        </Route>
      </>
    )
  );
  return (
    <>
      <div className="pop-modal hidden fixed z-1900 w-full h-full bg-black/50 bg-opacity-80 flex items-center justify-center" id="isSending">
        <div className="modal-content bg-gray-900 rounded-xl p-8 shadow-2xl max-w-md mx-auto">
          <div className="flex flex-col items-center">
            {/* Logo with pulse animation */}
            <div className="relative mb-6">
              {/* <div className="absolute inset-0 bg-blue-500 rounded-full opacity-30 animate-ping"></div> */}
              <div className="relative z-10 p-2">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">SecureDeal</span>
              </div>
            </div>
            
            {/* Loading spinner */}
            <div className="loader mb-4">
              <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            
            {/* Loading text */}
            <div className="text-center">
              <p className="text-blue-400 font-medium text-lg mb-1" id="sending-msg"></p>
              <p className="text-gray-400 text-sm">Please wait a moment</p>
            </div>
            
            {/* Progress bar */}
            {/* <div className="w-full bg-gray-700 rounded-full h-1.5 mt-6 overflow-hidden">
              <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{width: '70%'}}></div>
            </div> */}
          </div>
        </div>
      </div>
      <RouterProvider router={router} />
    </>
  );
};

export default App;