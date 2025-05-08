import { useState } from "react";
import Layout from "../layout/layout";
import ProfilePage from "./profile";

const Settings = () => {
       const [isMobile, setIsMobile] = useState(false);
        const [isSidebarOpen, setSidebarOpen] = useState(true);
    return ( <>
    <div className="min-h-screen bg-gray-800 font-sans text-gray-100 flex relative overflow-hidden">
     <Layout active="Settings"/>
     <ProfilePage isMobile={isMobile}
      isSidebarOpen={isSidebarOpen} />
    </div>


    </> );
}
 
export default Settings;