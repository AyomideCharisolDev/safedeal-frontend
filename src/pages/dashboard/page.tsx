import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { IoWalletOutline } from "react-icons/io5";
import { BsShieldLock, BsArrowRightShort } from "react-icons/bs";
import { AiOutlineInbox, AiOutlineCopy } from "react-icons/ai";
import { FaHandshake, FaFileContract } from "react-icons/fa";
import { RiTimerFlashLine } from "react-icons/ri";
import Layout from "./layout/layout";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../states";
import { useNavigate } from "react-router-dom";
import { copyToClipboard, isSending } from "../../utils/useutils";
import { Loader, Loader2, Clock, Trash2Icon } from "lucide-react";
import { acceptRequestApi, deleteDealApi } from "../../data/apis";
import useUserAuthContext from "../../hook/userUserAuthContext";
import { makeRequest } from "../../hook/useApi";
import { setDeals } from "../../states/dealSlice";
import { db } from "../../dexieDB";

const Dashboard = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const currentUser = useSelector((state: RootState) => state.user.currentUser);
    const dealLoading = useSelector((state: RootState) => state.deals.dealLoading);
    const deals = useSelector((state: RootState) => state.deals.deals);
    const dealError = useSelector((state: RootState) => state.deals.dealError);
    const [activeTab, setActiveTab] = useState('created');
    const Navigate = useNavigate();
    const { token } = useUserAuthContext();
    const dispatch = useDispatch();
    const [showConfirmDecline, setShowConfirmDecline] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [dealToDecline, setDealToDecline] = useState(null);

    // Filter deals user is working on (deals where the user is the freelancer/service provider)
    const dealsWorkingOn = deals.filter((deal:any) =>
        deal.secureId === currentUser?.secureId &&
        !["awaiting approval", "declined", "canceled"].includes(deal.progressStatus)
    );

    const handleSubmitDeliverables = (dealId:any) => {
        // Handle submit deliverables logic
        console.log("Submitting deliverables for", dealId);
    };

    // Function to calculate time remaining until expiry
    const calculateTimeRemaining = (expiryDate:any) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffInMs = expiry.getTime() - now.getTime();

        if (diffInMs <= 0) return "Expired";

        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffInHours > 24) {
            const days = Math.floor(diffInHours / 24);
            return `request expires in ${days} day${days > 1 ? 's' : ''}`;
        }

        return `${diffInHours}h ${diffInMinutes}m left`;
    };

    // Filter pending deal requests (awaiting approval and not expired)
    const pendingDealRequests = deals.filter((deal:any) => {
        const isAwaitingApproval = deal.progressStatus === "awaiting approval";
        const isForCurrentUser = deal.secureId === currentUser?.secureId;
        const isNotExpired = new Date(deal.requestExpiryDate) > new Date();
        return isAwaitingApproval && isForCurrentUser && isNotExpired;
    });

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

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    const handleDeclineDeal = (dealId:any) => {
        // Set the deal to decline and show confirmation modal
        setDealToDecline(dealId);
        setShowConfirmDecline(true);
    };

    const handleDeleteDeal = (dealId:any) => {
        setDealToDecline(dealId);
        setShowConfirmDelete(true);
    };

    const confirmDeclineDeal = async () => {
        if (!dealToDecline) return;
        isSending(true, "Processing...");
        const { res, error } = await makeRequest(
            "POST",
            acceptRequestApi,
            { secureId: currentUser?.secureId, dealId: dealToDecline, status: "declined" },
            () => { isSending(false, "") },
            token,
            "urlencoded"
        );
        if (res) {
            const updatedDeals = deals.map((deal:any) =>
                deal._id === dealToDecline ? { ...deal, progressStatus: "declined" } : deal
            );
            dispatch(setDeals(updatedDeals));
            await db.cached_data.put(updatedDeals, `${currentUser?._id}_deals`)
            setShowConfirmDecline(false);
            setDealToDecline(null);
        }
    };

    const confirmDeleteDeal = async () => {
        isSending(true, "Deleting...");
        const { res, error } = await makeRequest(
            "DELETE",
            deleteDealApi,
            { secureId: currentUser?.secureId, dealId:dealToDecline },
            () => { isSending(false, "") },
            token,
            "urlencoded"
        );

        if (res) {
            const updatedDeals = deals.filter((deal:any) => deal._id !== dealToDecline);
            dispatch(setDeals(updatedDeals));
            await db.cached_data.put(updatedDeals, `${currentUser?._id}_deals`)
            setShowConfirmDelete(false);
            setDealToDecline(null);
        }
    };

    // Helper function to get status information based on progressStatus
    const getStatusInfo = (progressStatus:any) => {
        switch (progressStatus?.toLowerCase()) {
            case "awaiting approval":
                return {
                    bgColor: "bg-amber-500/20",
                    textColor: "text-amber-400",
                    icon: <Loader className="fas text-yellow fa-spin" />,
                    label: "awaiting approval"
                };
            case "declined":
                return {
                    bgColor: "bg-red-500/20",
                    textColor: "text-red-400",
                    icon: "⚠️",
                    label: "request declined"
                };
            case "awaiting payment":
                return {
                    bgColor: "bg-blue-500/20",
                    textColor: "text-blue-400",
                    icon: "💰",
                    label: "awaiting payment"
                };
            case "in progress":
                return {
                    bgColor: "bg-green-500/20",
                    textColor: "text-green-400",
                    icon: "✓",
                    label: "in progress"
                };
            case "completed":
                return {
                    bgColor: "bg-green-500/20",
                    textColor: "text-green-400",
                    icon: "✓",
                    label: "completed"
                };
            case "dispute":
                return {
                    bgColor: "bg-red-500/20",
                    textColor: "text-red-400",
                    icon: "⚠️",
                    label: "dispute in progress"
                };
            case "canceled":
                return {
                    bgColor: "bg-red-500/20",
                    textColor: "text-red-400",
                    icon: "✕",
                    label: "deal canceled"
                };
            default:
                return {
                    bgColor: "bg-gray-500/20",
                    textColor: "text-gray-400",
                    icon: "?",
                    label: "unknown status"
                };
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-900 font-sans text-gray-100 flex relative overflow-hidden">
                <Layout active="Dashboard" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="z-10 w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                    <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 md:py-12" style={{ marginLeft: isMobile ? "0" : isSidebarOpen ? "240px" : "0", transition: "margin-left 0.3s ease" }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-8xl mt-20">
                            {/* Welcome Section */}
                            <div className="mb-8 relative">
                                <div className="px-6 py-8 bg-gradient-to-r from-purple-700 to-blue-600 rounded-t-2xl shadow-lg overflow-hidden relative">
                                    {/* Decorative Element */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full -ml-20 -mb-20"></div>

                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
                                        <div>
                                            <motion.h1
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: 0.2 }}
                                                className="text-2xl md:text-3xl font-bold text-white"
                                            >
                                                Welcome back, <span className="text-3xl font-bold">{currentUser?.firstName}</span>
                                            </motion.h1>
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: 0.3 }}
                                                className="mt-2 flex flex-row space-x-2 items-center"
                                            >
                                                <span className="text-gray-100 text-sm px-3 py-1 bg-gray-800/30 backdrop-blur-md rounded-lg flex items-center">
                                                    <span className="font-bold upper-case">Secure ID: <span className="font-light">{currentUser?.secureId?.slice(0, 10) + "..." || "XXXXXXXX"}</span></span>
                                                    <motion.span
                                                        className="p-1 cursor-pointer text-blue-200 ml-2"
                                                        whileHover={{ scale: 1.2 }}
                                                        onClick={() => { copyToClipboard(currentUser?.secureId) }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <AiOutlineCopy className="w-4 h-4" />
                                                    </motion.span>
                                                </span>
                                            </motion.div>
                                        </div>

                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4, duration: 0.5 }}
                                            whileHover={{ scale: 1.05 }}
                                            onClick={() => { Navigate("/dashboard/create") }}
                                            whileTap={{ scale: 0.95 }}
                                            className="mt-4 md:mt-0 px-6 py-3 rounded-lg bg-white text-purple-600 font-bold shadow-lg flex items-center space-x-2 hover:bg-gray-100 transition-all"
                                        >
                                            <span>Create New Deal</span>
                                            <BsArrowRightShort className="w-5 h-5" />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            {/* Account Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Balance Card */}
                                <motion.div
                                    custom={0}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 relative overflow-hidden shadow-lg group hover:border-purple-500/30 transition-all"
                                >
                                    <motion.div
                                        className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-xl -mr-20 -mt-20"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 5,
                                            repeat: Infinity,
                                            repeatType: "reverse"
                                        }}
                                    />

                                    <div className="flex flex-col space-y-2 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <motion.span
                                                className="w-12 h-12 items-center justify-center text-xl text-purple-400 flex rounded-full bg-gray-900/70 group-hover:bg-purple-500/20 transition-all"
                                                whileHover={{ rotate: 15 }}
                                            >
                                                <IoWalletOutline className="w-6 h-6" />
                                            </motion.span>
                                        </div>
                                        <div className="pt-2"><span className="text-sm font-bold text-gray-300">Available Balance</span></div>
                                    </div>

                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-4 relative z-10">
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5, duration: 0.5 }}
                                            className="flex flex-col text-3xl md:text-4xl font-bold"
                                        >
                                            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                                USDC 0
                                            </span>
                                            <span className="text-sm font-mono flex mt-1 text-gray-400">~ $0.00</span>
                                        </motion.span>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center shadow-lg"
                                        >
                                            Withdraw Funds
                                            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </motion.button>
                                    </div>
                                </motion.div>

                                {/* Escrow Card */}
                                <motion.div
                                    custom={1}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 relative overflow-hidden shadow-lg group hover:border-blue-500/30 transition-all"
                                >
                                    <motion.div
                                        className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-xl -mr-20 -mt-20"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 6,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            delay: 0.5
                                        }}
                                    />

                                    <div className="flex flex-col space-y-2 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <motion.span
                                                className="w-12 h-12 items-center justify-center text-xl text-blue-400 flex rounded-full bg-gray-900/70 group-hover:bg-blue-500/20 transition-all"
                                                whileHover={{ rotate: 15 }}
                                            >
                                                <BsShieldLock className="w-6 h-6" />
                                            </motion.span>
                                            <span className="text-xs font-medium px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                                                3 active deals
                                            </span>
                                        </div>
                                        <div className="pt-2"><span className="text-sm font-bold text-gray-300">Funds in Escrow</span></div>
                                    </div>

                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-4 relative z-10">
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.6, duration: 0.5 }}
                                            className="flex flex-col text-3xl md:text-4xl font-bold"
                                        >
                                            <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                                                USDC 0.00
                                            </span>
                                            <span className="text-sm font-mono flex mt-1 text-gray-400">~ $0.00</span>
                                        </motion.span>

                                        <div className="flex space-x-3">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="flex flex-col items-center px-4 py-2 bg-gray-900/70 rounded-lg"
                                            >
                                                <span className="text-xs text-gray-400">Active</span>
                                                <span className="text-xl font-bold text-blue-400">3</span>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="flex flex-col items-center px-4 py-2 bg-gray-900/70 rounded-lg"
                                            >
                                                <span className="text-xs text-gray-400">Pending</span>
                                                <span className="text-xl font-bold text-amber-400">2</span>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="flex flex-col items-center px-4 py-2 bg-gray-900/70 rounded-lg"
                                            >
                                                <span className="text-xs text-gray-400">Completed</span>
                                                <span className="text-xl font-bold text-green-400">28</span>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Recent Requests Section*/}
                            {pendingDealRequests?.length > 0 && (
                                <motion.div
                                    custom={5}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="mt-6 bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-semibold">Deal Requests</h2>
                                            {pendingDealRequests.length > 0 && (
                                                <span className="text-xs font-medium px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                                                    {pendingDealRequests.length} new request{pendingDealRequests.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            {pendingDealRequests.length > 0 ? (
                                                pendingDealRequests.map((deal, index) => (
                                                    <motion.div
                                                        key={deal._id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 1.1 + (index * 0.1) }}
                                                        className="bg-gray-900/70 rounded-xl p-4 border border-blue-500/30 transition-all relative overflow-hidden group"
                                                    >
                                                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-md -mr-10 -mt-10"></div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                                                                    <span className="text-blue-400">🔔</span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium">{deal.title}</h4>
                                                                    <div className="flex items-center text-xs text-gray-400 mt-1">
                                                                        <span>From: {deal.from} • </span>
                                                                        <span className="ml-2">Duration: {deal.duration} days</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                <span className="font-mono text-gray-300">{deal.price} {deal.currency}</span>
                                                                <div className="flex items-center justify-end text-xs mt-1">
                                                                    <span className="text-amber-400 flex items-center">
                                                                        <Clock className="w-3 h-3 mr-1" />
                                                                        {calculateTimeRemaining(deal.requestExpiryDate)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 pt-3 border-t border-gray-700">
                                                            <p className="text-xs text-gray-400 mb-3">{deal.description}</p>
                                                            <div className="flex justify-end space-x-2">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleDeclineDeal(deal._id)}
                                                                    className="px-4 py-2 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700"
                                                                >
                                                                    Decline
                                                                </motion.button>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => Navigate(`/dashboard/deals/${deal._id}`)}
                                                                    className="px-4 py-2 rounded text-xs bg-blue-600 text-white hover:bg-blue-700"
                                                                >
                                                                    View & Accept
                                                                </motion.button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-400">
                                                    <AiOutlineInbox className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                                    <p>No pending deal requests</p>
                                                </div>
                                            )}
                                        </div>
                                        {dealError && <span className="text-sm mt-3 right text-red-500">Failed to load recent data</span>}
                                        {dealLoading &&
                                            <span className="w-full pt-2 text-sm flex"> <span className="text-sm text-red-100 flex gap-1 justify-center items-center"><Loader className="fas fa-spin" /> fetching recent...</span></span>
                                        }
                                    </div>
                                </motion.div>
                            )}

                            {/* Recent Deals Section with Tabs */}
                            <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="mt-6 bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
                                <div className="p-6">
                                    {dealLoading &&
                                        <span className="w-full pb-2 text-sm flex"> <span className="text-sm text-red-100 flex gap-1 justify-center items-center"><Loader className="fas fa-spin" /> fetching recent...</span></span>
                                    }
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold flex items-justify align-centered">Deals </h2>
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-sm text-purple-400 hover:text-purple-300" onClick={() => { Navigate("/dashboard/all-deals") }}>
                                            View All
                                        </motion.button>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex border-b border-gray-700 mb-4">
                                        <motion.button
                                            whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'created' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}
                                            onClick={() => setActiveTab('created')}
                                        >
                                            My Created Deals
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'accepted' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}
                                            onClick={() => setActiveTab('accepted')}
                                        >
                                            Deals I'm Working On
                                        </motion.button>
                                    </div>
                                    {dealError && <span className="text-sm mt-3 right text-red-500">Failed to load recent data</span>}

                                    <div className="space-y-4">
                                        {activeTab === 'created' ? (
                                            deals.filter((deal:any) => deal.userId === currentUser?._id).length > 0 ? (
                                                deals.filter((deal:any) => deal.userId === currentUser?._id).map((deal:any, index:any) => {
                                                    const statusInfo = getStatusInfo(deal.progressStatus);

                                                    return (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.8 + (index * 0.1) }}
                                                            className="bg-gray-900/70 rounded-xl p-4 border border-gray-700 hover:border-blue-500/30 transition-all relative overflow-hidden group"
                                                        >
                                                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-md -mr-10 -mt-10"></div>

                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center">
                                                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mr-3">
                                                                        <FaFileContract className="text-blue-400 w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-medium">{deal.title}</h4>
                                                                        <div className="flex items-center text-xs text-gray-400 mt-1">
                                                                            <span>To: {deal.to || 'Not assigned'} • </span>
                                                                            <span className="ml-2">Duration: {deal.duration} days</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="text-right">
                                                                    <span className="font-mono text-gray-300">{deal.price} {deal.currency}</span>
                                                                    <div className="flex items-center justify-end text-xs mt-1">
                                                                        <span className={`p-1 px-2 rounded-full flex items-center ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                                                                            {typeof statusInfo.icon === 'string' ? statusInfo.icon : statusInfo.icon}
                                                                            <span className="ml-1">{statusInfo.label}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-4 pt-3 border-t border-gray-700">
                                                                <p className="text-xs text-gray-400 mb-3">{deal.description}</p>
                                                                <div className="flex justify-end space-x-2">
                                                                    {deal.progressStatus === "canceled" && (
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.05 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            onClick={() => handleDeleteDeal(deal._id)}
                                                                            className="px-4 py-2 rounded text-sm bg-gray-500/20 text-red-400 hover:bg-red-600/30"
                                                                        >
                                                                         <Trash2Icon/>
                                                                        </motion.button>
                                                                    )}
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => Navigate(`/dashboard/deals/${deal._id}`)}
                                                                        className="px-4 py-2 rounded text-xs bg-blue-600 text-white hover:bg-blue-700"
                                                                    >
                                                                        View Details
                                                                    </motion.button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-8 text-gray-400">
                                                    <AiOutlineInbox className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                                    <p>You haven't created any deals yet</p>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => { Navigate("/dashboard/create") }}
                                                        className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-colors"
                                                    >
                                                        Create Your First Deal
                                                    </motion.button>
                                                </div>
                                            )
                                        ) : (
                                            /* Deals I'm working on tab */
                                            dealsWorkingOn.length > 0 ? (
                                                dealsWorkingOn.map((deal:any, index:any) => {
                                                    const statusInfo = getStatusInfo(deal.progressStatus);

                                                    return (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.8 + (index * 0.1) }}
                                                            className="bg-gray-900/70 rounded-xl p-4 border border-gray-700 hover:border-green-500/30 transition-all relative overflow-hidden group"
                                                        >
                                                            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full blur-md -mr-10 -mt-10"></div>

                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center">
                                                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mr-3">
                                                                        <FaHandshake className="text-green-400 w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-medium">{deal.title}</h4>
                                                                        <div className="flex items-center text-xs text-gray-400 mt-1">
                                                                            <span>From: {deal.from} • </span>
                                                                            <span className="ml-2">Duration: {deal.duration} days</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="text-right">
                                                                    <span className="font-mono text-gray-300">{deal.price} {deal.currency}</span>
                                                                    <div className="flex items-center justify-end text-xs mt-1">
                                                                        <span className={`px-2 py-0.5 rounded-full flex items-center ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                                                                            {typeof statusInfo.icon === 'string' ? statusInfo.icon : statusInfo.icon}
                                                                            <span className="ml-1">{statusInfo.label}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-4 pt-3 border-t border-gray-700">
                                                                <p className="text-xs text-gray-400 mb-3">{deal.description}</p>
                                                                <div className="flex justify-end space-x-2">
                                                                    {deal.progressStatus === "in progress" && (
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.05 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            onClick={() => handleSubmitDeliverables(deal._id)}
                                                                            className="px-4 py-2 rounded text-xs bg-green-500/20 text-green-400 hover:bg-green-600/30"
                                                                        >
                                                                            Submit Deliverables
                                                                        </motion.button>
                                                                    )}
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => Navigate(`/dashboard/deals/${deal._id}`)}
                                                                        className="px-4 py-2 rounded text-xs bg-blue-600 text-white hover:bg-blue-700"
                                                                    >
                                                                        View Details
                                                                    </motion.button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-8 text-gray-400">
                                                    <RiTimerFlashLine className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                                    <p>You're not working on any deals at the moment</p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Confirmation Modal for Declining Deals */}
                            {showConfirmDecline && (
                                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700"
                                    >
                                        <h3 className="text-xl font-semibold mb-4">Decline Deal Request</h3>
                                        <p className="text-gray-300 mb-6">Are you sure you want to decline this deal request? This action cannot be undone.</p>
                                        <div className="flex justify-end space-x-3">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setShowConfirmDecline(false)}
                                                className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            >
                                                Cancel
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={confirmDeclineDeal}
                                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                            >
                                                Confirm Decline
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}

                            {/* Confirmation Modal for Declining Deals */}
                            {showConfirmDelete && (
                                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700"
                                    >
                                        <h3 className="text-xl font-semibold mb-4">Delete Deal</h3>
                                        <p className="text-gray-300 mb-6">Are you sure you want to delete this deal ? This action cannot be undone.</p>
                                        <div className="flex justify-end space-x-3">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setShowConfirmDelete(false)}
                                                className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            >
                                                Cancel
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={()=>{confirmDeleteDeal()}}
                                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                            >
                                                Confirm Delete
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;