import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
    AiOutlineBell,
    AiOutlineLogout,
    AiOutlineSetting,
    AiOutlineTransaction,
    AiOutlineShop,
    AiOutlineGlobal,
} from "react-icons/ai";
import { MdOutlineDashboard, MdLocalShipping } from "react-icons/md";
import { BsShieldLock } from "react-icons/bs";
import { useSelector } from "react-redux";
import { RootState } from "../../../states";
import useUserAuthContext from "../../../hook/userUserAuthContext";
import { useNavigate } from "react-router-dom";
import AccountTypePopup from "../settings/accountSetUp";
import { HiOutlineMenuAlt2 } from "react-icons/hi";

// Logout Confirmation Modal Component
const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }: any) => {
    // Reference to the audio element
    const audioRef = useRef<HTMLAudioElement>(null);

    // Play sound effect when modal opens
    useEffect(() => {
        if (isOpen && audioRef.current) {
            audioRef.current.play().catch((error: any) => {
                console.log("Audio playback failed:", error);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Animation variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 0.6, transition: { duration: 0.3 } }
    };

    const modalVariants = {
        hidden: { scale: 0.8, opacity: 0, y: 20 },
        visible: {
            scale: 1,
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        exit: {
            scale: 0.8,
            opacity: 0,
            y: 20,
            transition: {
                duration: 0.3
            }
        }
    };

    const buttonHoverVariants = {
        hover: {
            scale: 1.05,
            transition: { duration: 0.2 }
        },
        tap: {
            scale: 0.95,
            transition: { duration: 0.1 }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Audio element for click sound */}
            <audio ref={audioRef} preload="auto">
                <source src="/sounds/click.wav" type="audio/wav" />
                {/* Fallback audio format */}
                <source src="/sounds/click.wav" type="audio/wav" />
            </audio>

            {/* Backdrop */}
            <motion.div
                className="fixed inset-0 bg-black"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={overlayVariants}
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                className="bg-gray-900 w-full max-w-md m-3 rounded-xl overflow-hidden shadow-2xl relative z-10 border border-gray-800"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={modalVariants}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-purple-600/20 blur-xl -mr-6 -mt-6"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-blue-600/20 blur-xl -ml-6 -mb-6"></div>

                <div className="px-6 py-8">
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            className="w-16 h-16 rounded-full bg-gray-800 mb-4 flex items-center justify-center"
                            animate={{
                                rotate: [0, -5, 5, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                        >
                            <svg className="w-8 h-8 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </motion.div>

                        <h3 className="text-xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                            Are you sure you want to log out?
                        </h3>
                        <p className="text-gray-400 mb-6">
                            You'll need to sign in again to access your account.
                        </p>

                        <div className="flex space-x-4 w-full">
                            <motion.button
                                className="flex-1 py-3 px-4 rounded-lg bg-gray-800 text-gray-300 font-medium"
                                onClick={onClose}
                                variants={buttonHoverVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                Cancel
                            </motion.button>

                            <motion.button
                                className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
                                onClick={onConfirm}
                                variants={buttonHoverVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                Log Out
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const Layout = ({ active }: any) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const currentUser = useSelector((state: RootState) => state.user.currentUser);
    const { userLogout } = useUserAuthContext();
    // Sound effect reference for the logout button click
    const clickSoundRef = useRef(null);
    const Navigate = useNavigate();

    const menus = [
        { menu: "Dashboard", icon: <MdOutlineDashboard className="text-xl" />, url: "/dashboard" },
        { menu: "Manage Escrows", icon: <BsShieldLock className="text-xl" />, url: "/dashboard/escrows" },
        { menu: "Manage Deals", icon: <AiOutlineShop className="text-xl" />, url: "/dashboard/deals" },
        { menu: "My Purchases", icon: <MdLocalShipping className="text-xl" />, url: "/dashboard/purchases" },
        { menu: "Transactions", icon: <AiOutlineTransaction className="text-xl" />, url: "/dashboard/transactions" },
        { menu: "Merchants", icon: <AiOutlineGlobal className="text-xl" />, url: "/dashboard/merchants" },
        { menu: "Settings", icon: <AiOutlineSetting className="text-xl" />, url: "/dashboard/settings" }
    ]

    // Handler for showing logout modal with sound effect
    const handleShowLogoutModal = () => {
        // Play sound before showing modal
        if (clickSoundRef.current) {
            clickSoundRef.current.play().catch((error:any) => {
                console.log("Audio playback failed:", error);
                // Continue showing modal even if sound fails
                setShowLogoutModal(true);
            });

            // Set a slight delay before showing modal to allow sound to be heard
            setTimeout(() => {
                setShowLogoutModal(true);
            }, 50);
        } else {
            setShowLogoutModal(true);
        }
    };

    // Handler for confirming logout
    const handleLogout = () => {
        setShowLogoutModal(false);
        userLogout();
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Animation variants
    const sidebarVariants = {
        open: { x: 0, opacity: 1 },
        closed: { x: "-100%", opacity: 0 },
    };

    const floatingBlobVariants = {
        animate: {
            x: [0, 10, -10, 0],
            y: [0, -10, 10, 0],
            transition: {
                x: {
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 12,
                    ease: "easeInOut"
                },
                y: {
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 8,
                    ease: "easeInOut"
                }
            }
        }
    };

    return (<>
        <div className="fixed inset-0 overflow-hidden z-0">
            <motion.div
                variants={floatingBlobVariants}
                animate="animate"
                className="absolute w-64 h-64 rounded-full bg-purple-600/20 blur-3xl top-0 left-0 transform translate-x-1/2 translate-y-1/2"
            />
            <motion.div
                variants={floatingBlobVariants}
                animate="animate"
                custom={2}
                className="absolute w-64 h-64 rounded-full bg-pink-600/20 blur-3xl bottom-0 right-0 transform translate-x-1/2 translate-y-1/2"
            />
            <motion.div
                variants={floatingBlobVariants}
                animate="animate"
                custom={3}
                className="absolute w-64 h-64 rounded-full bg-blue-600/20 blur-3xl bottom-32 left-1/2 transform -translate-x-1/2"
            />
        </div>

        {/* Audio element for click sound */}
        <audio ref={clickSoundRef} preload="auto">
            {/* <source src="/sounds/click.mp3" type="audio/mp3" /> */}
            {/* <source src="/sounds/click.ogg" type="audio/ogg" /> */}
            <source src="/sounds/click.wav" type="audio/wav" />
        </audio>

        {/* Mobile Menu Toggle */}

      
        {isMobile && (
              <motion.button
              initial={{ opacity: 0 }}
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white shadow-lg"
          >
              <HiOutlineMenuAlt2 className="w-6 h-6" />
          </motion.button>
        )}

        {/* Header - Fixed Top */}
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full p-4 px-6 md:px-20 bg-gray-900 fixed flex items-center justify-between right-0 top-0 z-20"
            style={{
                left: isMobile ? "0" : isSidebarOpen ? "240px" : "0",
                width: isMobile ? "100%" : isSidebarOpen ? "calc(100% - 240px)" : "100%",
                transition: "left 0.3s ease, width 0.3s ease"
            }}
        >
            <span className="text-md ml-10 mt-1 lg:ml-0 lg:mt-0 font-bold tracking-wide">Merchant Dashboard</span>

            <div className="flex items-center space-x-4 md:space-x-8">
                {/* Bell Icon with Notification Badge */}
                <motion.span
                    className="relative cursor-pointer text-xl md:text-2xl p-2 md:p-3 hover:bg-gray-800/50 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <AiOutlineBell />
                    {/* Notification Badge */}
                    <motion.span
                        animate="pulse"
                        className="absolute top-0 right-0 w-4 h-4 md:w-5 md:h-5 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                        0
                    </motion.span>
                </motion.span>

                {/* Profile Avatar */}
                <motion.span
                    className="w-8 h-8 md:w-10 md:h-10 cursor-pointer rounded-full bg-gray-950 text-white flex items-center justify-center font-bold"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">{currentUser?.firstName?.slice(0, 1)}{currentUser?.lastName?.slice(0, 1)}</span>
                </motion.span>
            </div>
        </motion.div>

        {/* Sidebar - Fixed Left */}
        <motion.div
            className="w-60 h-screen flex flex-col justify-between fixed left-0 top-0 bg-gray-900 p-5 z-20 shadow-lg"
            initial={isMobile ? "closed" : "open"}
            animate={isSidebarOpen ? "open" : "closed"}
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <div className="flex items-center space-x-2 py-4">
                <motion.svg
                    className="w-8 h-8 text-purple-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </motion.svg>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">SecureEscrow</span>
            </div>

            <div className="space-y-3 mt-6 pt-15">
                {/* Dynamic Menu Items from menus array */}
                {menus.map((item, index) => (
                    <motion.div
                        key={index}
                        className={`flex items-center space-x-4 ${active === item.menu ? 'bg-gray-950' : 'hover:bg-gray-700'} p-3 rounded-lg cursor-pointer`}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { Navigate(item?.url) }}
                    >
                        <span className={active === item.menu ? "text-purple-500" : "text-gray-400"}>
                            {item.icon}
                        </span>
                        <span className={`text-md font-bold tracking-wide ${active === item.menu ? 'text-purple-500' : ''}`}>
                            {item.menu}
                        </span>
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="flex items-center space-x-4 hover:bg-gray-700 p-3 rounded-lg cursor-pointer mt-auto"
                whileHover={{ x: 5, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleShowLogoutModal} // Updated to use the new handler with sound
            >
                <AiOutlineLogout className="text-gray-400 text-md" />
                <span className="text-md">Log out</span>
            </motion.div>
        </motion.div>

        {isMobile && isSidebarOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black z-10"
                onClick={() => setSidebarOpen(false)}
            />
        )}

        {/* Logout Confirmation Modal */}
        <LogoutConfirmationModal
            isOpen={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={handleLogout}
        />

        <AccountTypePopup />
    </>);
}

export default Layout;