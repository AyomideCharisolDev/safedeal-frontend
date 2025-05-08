import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    FileText,
    Download,
    Check,
    X,
    AlertTriangle,
    Calendar,
    Clock,
    DollarSign,
    ChevronDown,
    ChevronUp,
    User,
    MessageSquare,
    ExternalLink,
    Info,
    Image as ImageIcon,
    ArrowBigLeft,
    Trash,
    Trash2
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../states';
import { useNavigate, useParams } from 'react-router-dom';
import { isSending } from '../../../utils/useutils';
import { makeRequest } from '../../../hook/useApi';
import { acceptRequestApi, cancelDealApi, deleteDealApi } from '../../../data/apis';
import useUserAuthContext from '../../../hook/userUserAuthContext';
import { setDeals } from '../../../states/dealSlice';
import { db } from '../../../dexieDB';
import MakePayment from '../payment/makepayment';

export default function DealDetails() {
    const deals = useSelector((state: RootState) => state.deals.deals);
    const currentUser = useSelector((state: RootState) => state.user.currentUser);
    const [isLoading, setIsLoading] = useState(true);
    const [deal, setDeal] = useState<any>(null);
    const [isAgreementOpen, setIsAgreementOpen] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState('details');
    const [selectedImage, setSelectedImage] = useState(null);
    const [showFullImage, setShowFullImage] = useState(false);
    const { dealId } = useParams();
    const Navigate = useNavigate();
    const dispatch = useDispatch()
    const { token } = useUserAuthContext();

    useEffect(() => {
        if (deals) {
            const details = deals.find((i: any) => i._id == dealId);
            if (!details) {
                setDeal(null)
                return
            }
            setDeal(details)
            setIsLoading(false);
        }
    }, [deals]);

    const toggleAccordion = (section: any) => {
        setActiveAccordion(activeAccordion === section ? null : section);
    };

    const handleAcceptDeal = async () => {
        if (!termsAccepted) {
            return;
        }
        isSending(true, "Processing...");
        const { res, error } = await makeRequest(
            "POST",
            acceptRequestApi,
            { secureId: currentUser?.secureId, dealId: deal._id, status: "accepted" },
            () => { isSending(false, "") },
            token,
            "urlencoded"
        );

        if (res) {
            const updatedDeals = deals.map((dl: any) =>
                dl._id === deal?._id ? { ...deal, progressStatus:"awaiting payment" } : dl
            );
            dispatch(setDeals(updatedDeals));
            await db.cached_data.put(updatedDeals, `${currentUser?._id}_deals`)
            setShowConfirmation(true);
            setIsAccepting(false);
            Navigate(`/dashboard`)
        }
    };

    const formatDate = (dateString: any) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const getDeadlineDate = () => {
        if (!deal?.createdAt || !deal?.duration) return "Not set";
        const createdDate = new Date(deal.createdAt);
        const deadlineDate = new Date(createdDate);
        deadlineDate.setDate(deadlineDate.getDate() + deal.duration);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(deadlineDate);
    };

    const [showCancelDeal, setShowCancelDeal] = useState(false);
    const [dealToCancel, setDealToCancel] = useState(null);

    // Add this function to handle initiating the cancel process
    const handleCancelDeal = (dealId: any) => {
        setDealToCancel(dealId);
        setShowCancelDeal(true);
    };

    const handleDeleteDeal = (dealId: any) => {
        setDealToCancel(dealId);
        setShowConfirmDelete(true);
    };

    // Add this function to confirm the deal cancellation
    const confirmCancelDeal = async () => {
        if (!dealToCancel) return;

        isSending(true, "Processing cancellation...");
        // Replace with your actual API endpoint for cancelling deals
        const { res, error } = await makeRequest(
            "POST",
            cancelDealApi,
            { userId: currentUser?.userId, dealId: dealToCancel },
            () => { isSending(false, "") },
            token,
            "urlencoded"
        );

        if (res) {
            const updatedDeals = deals.map((deal: any) =>
                deal._id === dealToCancel ? { ...deal, progressStatus: "canceled" } : deal
            );
            dispatch(setDeals(updatedDeals));
            await db.cached_data.put(updatedDeals, `${currentUser?._id}_deals`)
            setShowCancelDeal(false);
            setDealToCancel(null);
        }
    };

    const confirmDeleteDeal = async () => {
        isSending(true, "Deleting...");
        const { res, error } = await makeRequest(
            "DELETE",
            deleteDealApi,
            { secureId: currentUser?.secureId, dealId: deal?._id },
            () => { isSending(false, "") },
            token,
            "urlencoded"
        );

        if (res) {
            const updatedDeals = deals.filter((deal: any) => deal._id !== deal?._id);
            dispatch(setDeals(updatedDeals));
            await db.cached_data.put(updatedDeals, `${currentUser?._id}_deals`)
            Navigate('/dashboard')
        }
    };


    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    const fadeInVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-t-purple-500 border-purple-500/30 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-400">Loading deal details...</p>
                </div>
            </div>
        );
    }

    if (!deal) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700">
                    <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Deal Not Found</h2>
                    <p className="text-gray-400">The deal you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-6 pb-16">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-5xl mx-auto px-4"
            >
                {/* Header */}
                <motion.div variants={itemVariants} onClick={() => { Navigate('/dashboard') }} className="mb-6 pt-1">
                    <div className="flex items-center mb-2">
                        <ArrowBigLeft className="text-purple-500 mr-2" size={20} />
                        <span className="text-sm text-gray-400 p-4">Back </span>
                    </div>
                    <h1 className="text-3xl mt-10 font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                        {deal.title}
                    </h1>
                </motion.div>


                {/* Status Bar */}
                <motion.div
                    variants={itemVariants}
                    className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700 flex flex-wrap justify-between items-center gap-4"
                >
                    {deal.progressStatus === 'awaiting approval' && <>
                        <div className="flex items-center">
                            <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                                <Clock size={16} className="mr-1.5" />
                                Pending Approval
                            </div>
                        </div>
                    </>}

                    {deal.progressStatus === 'awaiting payment' && <>
                        <div className="flex items-center">
                            <div className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                                <Clock size={16} className="mr-1.5" />
                                Awaiting Payment {deal?.userId !== currentUser?._id ? 'from client' : 'from you'}
                            </div>
                        </div>
                    </>}

                    {deal.progressStatus === 'in progress' && <>
                        <div className="flex items-center">
                            <div className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                                <Clock size={16} className="mr-1.5" />
                                In Progress
                            </div>
                        </div>
                    </>}

                    {deal.progressStatus === 'declined' && <>
                        <div className="flex items-center">
                            <div className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                                <Clock size={16} className="mr-1.5" />
                                Deal declined
                            </div>
                        </div>
                    </>}

                    {deal.progressStatus === 'canceled' && <>
                        <div className="flex items-center">
                            <div className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                                <Clock size={16} className="mr-1.5" />
                                Deal Canceled
                            </div>
                        </div>
                    </>}

                    <div className="flex items-center space-x-6">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400">Created</span>
                            <span className="text-sm font-medium text-gray-200">{formatDate(deal.createdAt)}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400">Deal ID</span>
                            <span className="text-sm font-mono text-gray-200">{deal._id.slice(0, 10)}...</span>
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content */}
                    <motion.div variants={itemVariants} className="flex-1 space-y-6">
                        {/* Deal Details Accordion */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-750"
                                onClick={() => toggleAccordion('details')}
                            >
                                <div className="flex items-center">
                                    <Info size={18} className="text-blue-400 mr-2" />
                                    <h2 className="text-lg font-medium">Deal Details</h2>
                                </div>
                                {activeAccordion === 'details' ? (
                                    <ChevronUp size={20} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={20} className="text-gray-400" />
                                )}
                            </div>

                            <AnimatePresence>
                                {activeAccordion === 'details' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 pt-5 border-t border-gray-700">
                                            <div className="prose prose-sm prose-invert max-w-none">
                                                <p className="text-gray-300 mb-4">{deal.description}</p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                                    <div className="bg-gray-750 p-3 rounded-lg flex items-center">
                                                        <DollarSign size={18} className="text-green-400 mr-2" />
                                                        <div>
                                                            <span className="text-sm text-gray-400 block">Price</span>
                                                            <span className="font-medium">{deal.price} {deal.currency}</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-750 p-3 rounded-lg flex items-center">
                                                        <Calendar size={18} className="text-purple-400 mr-2" />
                                                        <div>
                                                            <span className="text-sm text-gray-400 block">Deadline</span>
                                                            <span className="font-medium">{getDeadlineDate()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-750 p-3 rounded-lg flex items-center">
                                                        <User size={18} className="text-blue-400 mr-2" />
                                                        {deal?.userId === currentUser?._id ? (
                                                            <div>
                                                                <span className="text-sm text-gray-400 block">With</span>
                                                                <span className="font-medium">{deal.to}</span>
                                                            </div>

                                                        ) : (

                                                            <div>
                                                                <span className="text-sm text-gray-400 block">Client</span>
                                                                <span className="font-medium">{deal.from}</span>
                                                            </div>
                                                        )

                                                        }

                                                    </div>

                                                    <div className="bg-gray-750 p-3 rounded-lg flex items-center">
                                                        <Clock size={18} className="text-yellow-400 mr-2" />
                                                        <div>
                                                            <span className="text-sm text-gray-400 block">Duration</span>
                                                            <span className="font-medium">{deal.duration} days</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Deliverables Accordion */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-750"
                                onClick={() => toggleAccordion('deliverables')}
                            >
                                <div className="flex items-center">
                                    <FileText size={18} className="text-purple-400 mr-2" />
                                    <h2 className="text-lg font-medium">Deliverables</h2>
                                </div>
                                {activeAccordion === 'deliverables' ? (
                                    <ChevronUp size={20} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={20} className="text-gray-400" />
                                )}
                            </div>

                            <AnimatePresence>
                                {activeAccordion === 'deliverables' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 pt-0 border-t border-gray-700">
                                            <div className="space-y-3">
                                                {deal.deliverables.map((item: any, index: any) => (
                                                    <div key={index} className="flex items-center p-3 bg-gray-750 rounded-lg">
                                                        <div className="w-6 h-6 mr-3 flex-shrink-0 rounded-full border border-gray-600 flex items-center justify-center">
                                                            {item.completed ? (
                                                                <Check size={14} className="text-green-400" />
                                                            ) : (
                                                                <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                                                            )}
                                                        </div>
                                                        <span className="text-gray-200">{item.description}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Agreement Files Accordion */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-750"
                                onClick={() => toggleAccordion('files')}
                            >
                                <div className="flex items-center">
                                    <FileText size={18} className="text-blue-400 mr-2" />
                                    <h2 className="text-lg font-medium">Agreement Documents</h2>
                                </div>
                                {activeAccordion === 'files' ? (
                                    <ChevronUp size={20} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={20} className="text-gray-400" />
                                )}
                            </div>

                            <AnimatePresence>
                                {activeAccordion === 'files' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 pt-0 border-t border-gray-700">
                                            {deal.files.length > 0 ? (
                                                <div className="space-y-3">
                                                    {deal.files.map((file: any, index: any) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
                                                            <div className="flex items-center">
                                                                <div className="w-10 h-10 bg-purple-500/20 rounded-md flex items-center justify-center mr-3">
                                                                    <FileText size={20} className="text-purple-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-200">{file.name}</p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {file.type.split('/')[1]?.toUpperCase() || 'Document'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => setIsAgreementOpen(true)}
                                                                className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                                                            >
                                                                <Download size={14} className="mr-1.5" />
                                                                Download
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-gray-400">
                                                    <FileText size={24} className="mx-auto mb-2 opacity-50" />
                                                    <p>No agreement documents available</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Reference Images Accordion */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-750"
                                onClick={() => toggleAccordion('images')}
                            >
                                <div className="flex items-center">
                                    <ImageIcon size={18} className="text-green-400 mr-2" />
                                    <h2 className="text-lg font-medium">Reference Images</h2>
                                </div>
                                {activeAccordion === 'images' ? (
                                    <ChevronUp size={20} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={20} className="text-gray-400" />
                                )}
                            </div>

                            <AnimatePresence>
                                {activeAccordion === 'images' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 pt-0 border-t border-gray-700">
                                            {deal.images.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {deal.images.map((image: any, index: any) => (
                                                        <div
                                                            key={index}
                                                            className="group relative cursor-pointer rounded-lg overflow-hidden"
                                                            onClick={() => {
                                                                setSelectedImage(image);
                                                                setShowFullImage(true);
                                                            }}
                                                        >
                                                            <img
                                                                src={image.secure_url}
                                                                alt={`Reference ${index + 1}`}
                                                                className="w-full h-32 p-4 object-cover transition-transform group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                                                <span className="text-xs text-white">View larger</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-gray-400">
                                                    <ImageIcon size={24} className="mx-auto mb-2 opacity-50" />
                                                    <p>No reference images available</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Sidebar - Action Panel */}
                    <motion.div
                        variants={itemVariants}
                        className="w-full lg:w-80 space-y-6"
                    >
                        {/* Action Card */}

                        {deal.userId !== currentUser?._id && (
                            <>
                                <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
                                    <h3 className="text-lg font-semibold mb-4">Deal Actions</h3>

                                    {deal.requestStatus === "awaiting approval" && (
                                        <div className="space-y-4">
                                            <div className="flex items-start space-x-2">
                                                <div className="mt-1">
                                                    <input
                                                        type="checkbox"
                                                        id="terms"
                                                        checked={termsAccepted}
                                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                                        className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-800"
                                                    />
                                                </div>
                                                <label htmlFor="terms" className="text-sm text-gray-300">
                                                    I have read and agree to the terms of this deal as specified in the agreement documents.
                                                </label>
                                            </div>

                                            <button
                                                onClick={handleAcceptDeal}
                                                disabled={!termsAccepted || isAccepting}
                                                className={`w-full py-3 rounded-lg flex items-center justify-center text-white font-medium 
                    ${!termsAccepted
                                                        ? 'bg-gray-600 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'}`}
                                            >
                                                {isAccepting ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={18} className="mr-2" />
                                                        Accept Deal
                                                    </>
                                                )}
                                            </button>

                                            <p className="text-xs text-gray-400 mt-2">
                                                By accepting this deal, you agree to complete all deliverables within the specified timeframe.
                                            </p>
                                        </div>
                                    )}

                                    {deal.requestStatus !== "awaiting approval" && (
                                        <div className="text-center py-4">
                                            <p className="text-gray-400">This deal has already been accepted by you.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Contact Card */}
                                <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
                                    <h3 className="text-lg font-semibold mb-4">Contact Client</h3>
                                    <button className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium flex items-center justify-center transition-colors">
                                        <MessageSquare size={16} className="mr-2" />
                                        Message Client
                                    </button>
                                </div>


                            </>
                        )}

                        {/* Security Info Card */}
                        <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-5">
                            <div className="flex items-center mb-3">
                                <Shield size={18} className="text-purple-400 mr-2" />
                                <h3 className="text-sm font-semibold">Secure Deal Protection</h3>
                            </div>
                            <p className="text-xs text-gray-400">
                                All payments are securely held in escrow until deliverables are confirmed.
                                Blockchain technology ensures transparency and security throughout the process.
                            </p>
                            <a href="#" className="inline-flex items-center text-xs text-purple-400 mt-3 hover:text-purple-300">
                                <span>Learn more</span>
                                <ExternalLink size={12} className="ml-1" />
                            </a>
                        </div>

                        {deal?.userId === currentUser?._id && deal.progressStatus == 'awaiting payment' && (
                    
                            <MakePayment deal={deal}/>
                    )}


                        {deal?.userId === currentUser?._id && deal.progressStatus === 'awaiting payment' && (<button
                            onClick={() => handleCancelDeal(deal?._id)}
                            className={`w-full py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium flex items-center justify-center transition-colors`}
                        >
                            Cancel Deal
                        </button>)}

                        {deal?.userId === currentUser?._id && deal.progressStatus === 'awaiting approval' && (<button
                            onClick={() => handleDeleteDeal(deal?._id)}
                            className={`w-full py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-2sm font-medium flex items-center justify-center transition-colors`}
                        >
                            Cancel & delete Request
                        </button>)}

                        {deal.progressStatus == 'canceled' && (<button
                            onClick={() => confirmDeleteDeal()}
                            className={`w-full items-center justify-center flex gap-2 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xl font-medium flex items-center justify-center transition-colors`}
                        >
                            Trash this <Trash2 size={15} />
                        </button>)}

                    </motion.div>
                </div>
            </motion.div>

            {/* Full Screen Image View */}
            <AnimatePresence>
                {showFullImage && selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setShowFullImage(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative max-w-4xl w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage?.secure_url}
                                alt="Reference Image"
                                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                            />
                            <button
                                className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                                onClick={() => setShowFullImage(false)}
                            >
                                <X size={20} className="text-white" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Agreement Preview */}
            <AnimatePresence>
                {isAgreementOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-gray-900 rounded-xl max-w-3xl w-full max-h-[80vh] flex flex-col border border-gray-700 overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <FileText size={18} className="text-purple-400 mr-2" />
                                    Agreement Document
                                </h3>
                                <button
                                    onClick={() => setIsAgreementOpen(false)}
                                    className="p-2 hover:bg-gray-800 rounded-full"
                                >
                                    <X size={18} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 bg-gray-850">
                                <div className="bg-white text-black rounded-lg p-6 min-h-[400px]">
                                    {/* Mock document content */}
                                    <div className="text-center mb-6">
                                        <h2 className="text-xl font-bold">Web Design Service Agreement</h2>
                                        <p className="text-gray-600">Contract ID: {deal._id}</p>
                                    </div>

                                    <div className="space-y-4 text-sm">
                                        <p className="font-semibold">THIS AGREEMENT is made on {formatDate(deal.createdAt)}</p>
                                        <p>BETWEEN:</p>
                                        <p><strong>{deal.buyerName}</strong> ("Client")</p>
                                        <p>AND</p>
                                        <p><strong>{deal.sellerName}</strong> ("Designer")</p>

                                        <p className="font-semibold mt-6">PROJECT SUMMARY:</p>
                                        <p>{deal.description}</p>

                                        <p className="font-semibold mt-6">DELIVERABLES:</p>
                                        <ul className="list-disc pl-5">
                                            {deal.deliverables.map((item, i) => (
                                                <li key={i}>{item.description}</li>
                                            ))}
                                        </ul>

                                        <p className="font-semibold mt-6">PAYMENT TERMS:</p>
                                        <p>Total Project Fee: {deal.price} {deal.currency}</p>
                                        <p>Payment will be held in escrow and released upon successful completion of all deliverables.</p>

                                        <p className="font-semibold mt-6">TIMELINE:</p>
                                        <p>The Designer agrees to complete all deliverables within {deal.duration} days of agreement acceptance.</p>

                                        <div className="mt-8 pt-8 border-t border-gray-300">
                                            <p className="text-center text-gray-500 italic">This is a simulated agreement document for demonstration purposes only.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-700 flex justify-between">
                                <button
                                    onClick={() => setIsAgreementOpen(false)}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                                >
                                    Close
                                </button>
                                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm flex items-center transition-colors">
                                    <Download size={14} className="mr-1.5" />
                                    Download PDF
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Confirmation */}
            <AnimatePresence>
                {showConfirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700 text-center"
                        >
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} className="text-green-500" />
                            </div>

                            <h3 className="text-xl font-bold mb-2">Deal Accepted!</h3>
                            <p className="text-gray-400 mb-6 text-sm">
                                You have successfully accepted this deal. The client has been notified, work can begin immediately after clients pays into escrow.
                            </p>

                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-lg font-medium transition-colors"
                            >
                                Got It
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {showCancelDeal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700"
                    >
                        <h3 className="text-xl font-bold mb-4">Cancel Deal</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to cancel this deal? This action may have financial implications and cannot be undone.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCancelDeal(false)}
                                className="px-4 py-2 rounded text-sm bg-gray-700 text-gray-300 hover:bg-gray-600"
                            >
                                Go Back
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => confirmCancelDeal()}
                                className="px-4 py-2 rounded text-sm bg-red-600 text-white hover:bg-red-700"
                            >
                                Cancel Deal
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
            
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
                                onClick={() => { confirmDeleteDeal() }}
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                                Confirm Delete
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}

        </div>
    );
}