import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, ChevronRight, ShoppingCart, Store, Users, Info, Shield, MessageCircle } from 'lucide-react';
import { makeRequest } from '../../../hook/useApi';
import { updateuserApi } from '../../../data/apis';
import { isSending, notifySuccess } from '../../../utils/useutils';
import useUserAuthContext from '../../../hook/userUserAuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../states';
import { setCurrentUser } from '../../../states/userSlice';

// Maximum number of wallet addresses allowed
const MAX_WALLETS = 5;

// Country code mapping
const countryPhoneCodes = {
    'Nigeria': '+234',
    'United States': '+1',
    'United Kingdom': '+44',
    'Canada': '+1',
    'Australia': '+61',
    'South Africa': '+27',
    'Kenya': '+254',
    'Ghana': '+233',
    'India': '+91',
    'China': '+86',
    'Brazil': '+55',
    'Russia': '+7',
    // Add more countries as needed
    'default': '+1' // Default country code
};

// Wallet types
const walletTypes = [
    {
        id: 'phantom',
        name: 'Phantom',
        logoPath: '/phantom.png',  // Path to the Phantom logo in public folder
        pattern: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,  // Solana address format
        errorMessage: 'Invalid Phantom wallet address. Please enter a valid Solana address.'
    },
    {
        id: 'solflare',
        name: 'Solflare',
        logoPath: '/solflare.png',  // Path to the Solflare logo in public folder
        pattern: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,  // Solana address format
        errorMessage: 'Invalid Solflare wallet address. Please enter a valid Solana address.'
    }
];

// Types
type SocialMediaPlatform = 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'tiktok' | 'phone';
type WalletType = 'phantom' | 'solflare';

// Platform-specific placeholders
const platformPlaceholders = {
    phone: "Enter phone number without country code",
    whatsapp: "Enter WhatsApp number or link",
    telegram: "Enter Telegram username or @handle",
    instagram: "Enter Instagram username without @",
    facebook: "Enter Facebook profile link or username",
    tiktok: "Enter TikTok username or @handle"
};

interface ContactDetail {
    id: string;
    platform: SocialMediaPlatform;
    username: string;
}

interface WalletAddress {
    id: string;
    name: string;
    address: string;
    walletType: WalletType;
}

const BusinessSetupPopup = () => {
    const currentUser = useSelector((state: RootState) => state.user.currentUser);
    const dispatch = useDispatch();
    const { token } = useUserAuthContext();
    const [step, setStep] = useState(1);
    const [businessName, setBusinessName] = useState('');
    const [businessDescription, setBusinessDescription] = useState('');
    const [contacts, setContacts] = useState<ContactDetail[]>([]);
    const [wallets, setWallets] = useState<WalletAddress[]>([]);
    const [newContact, setNewContact] = useState<{ platform: SocialMediaPlatform; username: string }>({
        platform: 'phone',
        username: ''
    });
    const [newWallet, setNewWallet] = useState<{ name: string; address: string; walletType: WalletType }>({
        name: '',
        address: '',
        walletType: 'phantom'
    });
    const [showPopup, setShowPopup] = useState(false);
    const [error, setError] = useState('');
    const [walletError, setWalletError] = useState('');
    const [countryCode, setCountryCode] = useState(countryPhoneCodes.default);

    useEffect(() => {
        // Check if user's businessName is undefined
        if (currentUser && !currentUser?.businessName) {
            setShowPopup(true);
        } else {
            setShowPopup(false);
        }

        // Set country code based on user's location
        if (currentUser?.location) {
            const userCountry = currentUser.location;
            const code = countryPhoneCodes[userCountry as keyof typeof countryPhoneCodes] || countryPhoneCodes.default;
            setCountryCode(code);
        }
    }, [currentUser]);

    const validateWalletAddress = (address: string, type: WalletType): boolean => {
        const walletType = walletTypes.find(wt => wt.id === type);
        if (!walletType) return false;

        return walletType.pattern.test(address);
    };

    const checkDuplicateAddress = (address: string): boolean => {
        return wallets.some(wallet => wallet.address.toLowerCase() === address.toLowerCase());
    };

    const addContact = () => {
        if (!newContact.username) {
            setError('Please enter contact information');
            return;
        }
        setError('');

        let contactValue = newContact.username;

        // Append country code to phone number if platform is phone or whatsapp
        if (newContact.platform === 'phone' && !contactValue.startsWith('+')) {
            contactValue = `${countryCode}${contactValue.startsWith('0') ? contactValue.slice(1) : contactValue}`;
        } else if (newContact.platform === 'whatsapp' && !contactValue.includes('+') && !contactValue.startsWith('http')) {
            contactValue = `${countryCode}${contactValue.startsWith('0') ? contactValue.slice(1) : contactValue}`;
        }

        setContacts([
            ...contacts,
            {
                id: Date.now().toString(),
                platform: newContact.platform,
                username: contactValue
            }
        ]);
        // Reset to default values after adding
        setNewContact({ platform: 'phone', username: '' });
    };

    const addWallet = () => {
        if (wallets.length >= MAX_WALLETS) {
            setError(`You can only add up to ${MAX_WALLETS} wallet addresses`);
            return;
        }

        if (!newWallet.name || !newWallet.address) {
            setError('Please fill in both wallet name and address');
            return;
        }

        // Check for duplicate address
        if (checkDuplicateAddress(newWallet.address)) {
            setWalletError('This wallet address has already been added');
            return;
        }

        // Validate wallet address format
        if (!validateWalletAddress(newWallet.address, newWallet.walletType)) {
            const walletType = walletTypes.find(wt => wt.id === newWallet.walletType);
            setWalletError(walletType?.errorMessage || 'Invalid wallet address');
            return;
        }

        setError('');
        setWalletError('');
        setWallets([
            ...wallets,
            {
                id: Date.now().toString(),
                name: newWallet.name,
                address: newWallet.address,
                walletType: newWallet.walletType
            }
        ]);
        setNewWallet({ name: '', address: '', walletType: 'phantom' });
    };

    const removeContact = (id: string) => {
        setContacts(contacts.filter(contact => contact.id !== id));
    };

    const removeWallet = (id: string) => {
        setWallets(wallets.filter(wallet => wallet.id !== id));
    };

    const validateBusinessInfo = () => {
        if (!businessName.trim()) {
            setError('Please enter a business name');
            return false;
        }
        setError('');
        return true;
    };

    const validateContactInfo = () => {
        if (contacts.length === 0) {
            setError('Please add at least one contact method');
            return false;
        }
        setError('');
        return true;
    };

    const validateWalletInfo = () => {
        if (wallets.length === 0) {
            setError('Please add at least one wallet address for withdrawals');
            return false;
        }
        setError('');
        return true;
    };

    const goToNextStep = () => {
        if (step === 1) {
            if (!validateBusinessInfo()) return;
        } else if (step === 2) {
            if (!validateContactInfo()) return;
        }

        setError('');
        setStep(step + 1);
    };

    const handleSubmit = async () => {
        if (!validateWalletInfo()) return;

        setError('');
        isSending(true, "Updating business information...");

        const updateData = {
            businessName,
            businessDescription,
            contacts,
            wallets
        };

        const cb = () => { isSending(false, ""); };
        const { res } = await makeRequest("POST", updateuserApi, updateData, cb, token, null, "urlencoded");
        if (res) {
            localStorage.setItem('escrow_user', JSON.stringify(res?.data));
            dispatch(setCurrentUser(res?.data));
            notifySuccess("Business setup completed successfully!");
            setShowPopup(false);
        }
    };

    // Get platform icon and label
    const getPlatformIcon = (platform: SocialMediaPlatform) => {
        switch (platform) {
            case 'phone': return '📞 Phone';
            case 'whatsapp': return '📱 WhatsApp';
            case 'telegram': return '📬 Telegram';
            case 'instagram': return '📸 Instagram';
            case 'facebook': return '👥 Facebook';
            case 'tiktok': return '🎵 TikTok';
            default: return '🔗 Link';
        }
    };

    // Get wallet type info
    const getWalletTypeInfo = (type: WalletType) => {
        const wallet = walletTypes.find(wt => wt.id === type);
        return {
            logoPath: wallet?.logoPath || '',
            name: wallet?.name || 'Wallet'
        };
    };

    // Get the step title and description
    const getStepInfo = () => {
        switch (step) {
            case 1:
                return {
                    title: 'Complete Your Business Profile',
                    description: 'Enter your business information to get started'
                };
            case 2:
                return {
                    title: 'Add Contact Information',
                    description: 'These details allow customers to inquire about your products'
                };
            case 3:
                return {
                    title: 'Connect Your Wallets',
                    description: 'Add wallet addresses to receive payments'
                };
            default:
                return {
                    title: 'Complete Your Business Setup',
                    description: 'Finish setting up your business profile'
                };
        }
    };

    const stepInfo = getStepInfo();

    if (!showPopup) return null;


    return (
        <>
            <div className="min-h-screen bg-gray-800 font-sans text-gray-100 flex relative overflow-hidden">

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
                >
                    {/* Decorative background SVGs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 0.4, scale: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute top-0 right-0 w-96 h-96"
                        >
                            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <path
                                    fill="#5B21B6"
                                    d="M37.6,-63.8C47.9,-56.5,54.9,-44.7,62.7,-32.4C70.5,-20.1,79.1,-7.4,79.3,5.6C79.5,18.7,71.3,32.1,61.3,42.5C51.3,52.9,39.6,60.3,27,65C14.4,69.8,0.8,71.9,-13.9,71.1C-28.7,70.4,-44.6,66.8,-57.3,57.7C-69.9,48.6,-79.3,34,-81.2,18.9C-83.1,3.8,-77.4,-11.8,-70.5,-26.1C-63.7,-40.4,-55.7,-53.3,-44.3,-60.2C-32.9,-67.1,-18.2,-68,-3.9,-61.8C10.4,-55.6,27.3,-71.2,37.6,-63.8Z"
                                    transform="translate(100 100)"
                                />
                            </svg>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 0.3, scale: 1 }}
                            transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
                            className="absolute bottom-0 left-0 w-80 h-80"
                        >
                            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <path
                                    fill="#1E40AF"
                                    d="M44.3,-76.5C55.6,-69.7,61.9,-53.8,65.9,-39.3C69.9,-24.8,71.5,-12.4,71.4,-0.1C71.3,12.3,69.5,24.6,64.3,36.2C59.1,47.8,50.6,58.6,39.5,66.2C28.5,73.8,14.2,78.2,-0.5,79C-15.2,79.8,-30.4,77.1,-43.6,70C-56.8,62.9,-68,51.4,-75.2,37.8C-82.5,24.2,-85.8,8.5,-82.8,-5.4C-79.8,-19.3,-70.4,-31.4,-59.5,-39.9C-48.5,-48.5,-36,-53.3,-24.4,-60.1C-12.8,-66.9,-2.1,-75.7,9.9,-79.5C21.9,-83.3,33,-83.2,44.3,-76.5Z"
                                    transform="translate(100 100)"
                                />
                            </svg>
                        </motion.div>
                    </div>

                    {/* Animated particles */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full bg-blue-400"
                                initial={{
                                    x: Math.random() * window.innerWidth,
                                    y: Math.random() * window.innerHeight,
                                    opacity: 0.1 + Math.random() * 0.5
                                }}
                                animate={{
                                    x: Math.random() * window.innerWidth,
                                    y: Math.random() * window.innerHeight,
                                    opacity: [0.1 + Math.random() * 0.5, 0.8, 0.1 + Math.random() * 0.5]
                                }}
                                transition={{
                                    duration: 5 + Math.random() * 15,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                            />
                        ))}
                    </div>

                    {/* Main Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                            duration: 0.6
                        }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] rounded-xl overflow-hidden relative"
                        style={{
                            boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)"
                        }}
                    >
                        {/* Glowing effect on top */}
                        <motion.div
                            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500"
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        />

                        {/* Graphic accent - Corner SVG */}
                        <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-20">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    fill="none"
                                    stroke="url(#headerGradient)"
                                    strokeWidth="2"
                                    d="M0,0 L100,0 L100,100"
                                />
                                <defs>
                                    <linearGradient id="headerGradient" gradientTransform="rotate(45)">
                                        <stop offset="0%" stopColor="#3B82F6" />
                                        <stop offset="100%" stopColor="#8B5CF6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        {/* Header with Icon */}
                        <motion.div
                            className="bg-gradient-to-r from-blue-800 to-indigo-800 px-6 py-5 flex-shrink-0 relative overflow-hidden"
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            {/* Animated circles in header */}
                            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-blue-500 opacity-20" />
                            <div className="absolute right-16 -bottom-10 w-24 h-24 rounded-full bg-indigo-600 opacity-10" />

                            <div className="flex items-center">
                                <motion.div
                                    className="mr-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-2 w-12 h-12 flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        damping: 10,
                                        stiffness: 100,
                                        delay: 0.3
                                    }}
                                >
                                    {step === 1 && <Store className="w-6 h-6 text-white" />}
                                    {step === 2 && <Users className="w-6 h-6 text-white" />}
                                    {step === 3 && <ShoppingCart className="w-6 h-6 text-white" />}
                                </motion.div>
                                <div>
                                    <motion.h2
                                        className="text-2xl font-bold text-white"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        {stepInfo.title}
                                    </motion.h2>
                                    <motion.p
                                        className="text-blue-100 mt-1"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        {stepInfo.description}
                                    </motion.p>
                                </div>
                            </div>

                            {/* Step Progress Bar */}
                            <motion.div
                                className="h-1 bg-blue-900/50 rounded-full mt-5 overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${(step / 3) * 100}%` }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                />
                            </motion.div>
                        </motion.div>

                        {/* Content Area */}
                        <div className="p-6 overflow-y-auto flex-grow">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4 flex items-center"
                                >
                                    <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-6">
                                            <h3 className="text-xl font-semibold mb-1">Business Details</h3>
                                            <div className="bg-blue-900 bg-opacity-20 border border-blue-500 text-blue-200 px-4 py-3 rounded-lg flex items-start mb-4">
                                                <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                                <p>Let's start by setting up your business profile. This information will be visible to your customers.</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-750 rounded-xl p-4 mb-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Business Name *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter your business name"
                                                        value={businessName}
                                                        onChange={(e) => setBusinessName(e.target.value)}
                                                        className="w-full bg-gray-800 rounded-lg px-3 py-2 border border-gray-600"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Business Description (Optional)</label>
                                                    <textarea
                                                        placeholder="Tell customers about your business"
                                                        value={businessDescription}
                                                        onChange={(e) => setBusinessDescription(e.target.value)}
                                                        className="w-full bg-gray-800 rounded-lg px-3 py-2 border border-gray-600 min-h-24 resize-y"
                                                    />
                                                    <p className="text-xs text-gray-400 mt-1">This description will help customers understand what your business offers.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : step === 2 ? (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-6">
                                            <h3 className="text-xl font-semibold mb-1">Contact Information</h3>
                                            <div className="bg-blue-900 bg-opacity-20 border border-blue-500 text-blue-200 px-4 py-3 rounded-lg flex items-start mb-4">
                                                <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                                <p>Adding contact information allows potential customers to reach out to you with questions or inquiries about your products before making a purchase decision.</p>
                                            </div>
                                        </div>

                                        {/* Contact Section */}
                                        <div className="bg-gray-750 rounded-xl p-4 mb-4">
                                            <h4 className="font-medium mb-3 flex items-center">
                                                <span className="bg-blue-600 rounded-full p-1.5 mr-2">
                                                    <MessageCircle className="w-4 h-4 text-white" />
                                                </span>
                                                Contact Details
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                                <select
                                                    value={newContact.platform}
                                                    onChange={(e) => setNewContact({ ...newContact, platform: e.target.value as SocialMediaPlatform, username: '' })}
                                                    className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-600 col-span-1"
                                                >
                                                    <option value="phone">Phone Number</option>
                                                    <option value="whatsapp">WhatsApp</option>
                                                    <option value="telegram">Telegram</option>
                                                    <option value="instagram">Instagram</option>
                                                    <option value="facebook">Facebook</option>
                                                    <option value="tiktok">TikTok</option>
                                                </select>

                                                {newContact.platform === 'phone' ? (
                                                    <div className="bg-gray-800 rounded-lg border border-gray-600 flex items-center md:col-span-2">
                                                        <div className="flex-shrink-0 px-3 py-2 border-r border-gray-600 text-gray-400">
                                                            {countryCode}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter phone number without country code"
                                                            value={newContact.username}
                                                            onChange={(e) => setNewContact({ ...newContact, username: e.target.value })}
                                                            className="bg-gray-800 rounded-lg px-3 py-2 flex-grow"
                                                        />
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        placeholder={platformPlaceholders[newContact.platform]}
                                                        value={newContact.username}
                                                        onChange={(e) => setNewContact({ ...newContact, username: e.target.value })}
                                                        className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-600 md:col-span-2"
                                                    />
                                                )}
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={addContact}
                                                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium"
                                            >
                                                Add Contact
                                            </motion.button>

                                            {contacts.length > 0 && (
                                                <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
                                                    <p className="text-sm text-gray-400">Your contacts:</p>
                                                    {contacts.map(contact => (
                                                        <motion.div
                                                            key={contact.id}
                                                            layout
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="bg-gray-700 rounded-lg px-3 py-2 flex justify-between items-center"
                                                        >
                                                            <div className="flex items-center">
                                                                <span className="mr-2">{getPlatformIcon(contact.platform)}</span>
                                                                <span>{contact.username}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => removeContact(contact.id)}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>×</motion.span>
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-6">
                                            <h3 className="text-xl font-semibold mb-1">Wallet Information</h3>
                                            <div className="bg-blue-900 bg-opacity-20 border border-blue-500 text-blue-200 px-4 py-3 rounded-lg flex items-start mb-4">
                                                <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                                <p>Add wallet addresses to receive payments for your products. These will be used for withdrawals and shown to customers during the checkout process.</p>
                                            </div>
                                        </div>

                                        {/* Wallet Section */}
                                        <div className="bg-gray-750 rounded-xl p-4 mb-5">
                                            <h4 className="font-medium mb-3 flex items-center">
                                                <span className="bg-blue-600 rounded-full p-1.5 mr-2">
                                                    <Store className="w-4 h-4 text-white" />
                                                </span>
                                                Wallet Address
                                                <span className="ml-2 text-sm text-gray-400 flex items-center">
                                                    <Info className="w-4 h-4 mr-1" />
                                                    Maximum {MAX_WALLETS}
                                                </span>
                                            </h4>

                                            {wallets.length < MAX_WALLETS ? (
                                                <>
                                                    <div className="space-y-3 mb-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Wallet Name (e.g. My Main Wallet)"
                                                            value={newWallet.name}
                                                            onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                                                            className="w-full bg-gray-800 rounded-lg px-3 py-2 border border-gray-600"
                                                        />

                                                        {/* Wallet Type Selection with Actual Logos */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {walletTypes.map(walletType => (
                                                                <motion.div
                                                                    key={walletType.id}
                                                                    whileHover={{ scale: 1.02 }}
                                                                    whileTap={{ scale: 0.98 }}
                                                                    onClick={() => setNewWallet({ ...newWallet, walletType: walletType.id as WalletType })}
                                                                    className={`cursor-pointer bg-gray-800 rounded-lg p-3 flex items-center ${newWallet.walletType === walletType.id ? 'border-2 border-blue-500' : 'border border-gray-600'
                                                                        }`}
                                                                >
                                                                    <div className="w-8 h-8 mr-3 flex items-center justify-center">
                                                                        <img
                                                                            src={walletType.logoPath}
                                                                            alt={`${walletType.name} logo`}
                                                                            className="max-w-full max-h-full object-contain"
                                                                        />
                                                                    </div>
                                                                    <span className="font-medium">{walletType.name}</span>
                                                                </motion.div>
                                                            ))}
                                                        </div>

                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                placeholder={`Enter ${getWalletTypeInfo(newWallet.walletType).name} wallet address`}
                                                                value={newWallet.address}
                                                                onChange={(e) => {
                                                                    setNewWallet({ ...newWallet, address: e.target.value });
                                                                    setWalletError('');
                                                                }}
                                                                className={`w-full bg-gray-800 rounded-lg px-3 py-2 border ${walletError ? 'border-red-500' : 'border-gray-600'
                                                                    }`}
                                                            />
                                                            {walletError && (
                                                                <div className="text-red-400 text-sm mt-1 flex items-center">
                                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                                    {walletError}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={addWallet}
                                                        className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium"
                                                    >
                                                        Add Wallet
                                                    </motion.button>
                                                </>
                                            ) : (
                                                <div className="bg-blue-900 bg-opacity-30 border border-blue-500 text-blue-300 px-4 py-3 rounded-lg mb-3 flex items-center">
                                                    <Info className="w-5 h-5 mr-2" />
                                                    You've reached the maximum limit of {MAX_WALLETS} wallet addresses.
                                                </div>
                                            )}

                                            {wallets.length > 0 && (
                                                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                                                    <p className="text-sm text-gray-400">Your wallets ({wallets.length}/{MAX_WALLETS}):</p>
                                                    {wallets.map(wallet => (
                                                        <motion.div
                                                            key={wallet.id}
                                                            layout
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="bg-gray-700 rounded-lg p-3"
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center">
                                                                    <div className="w-6 h-6 mr-2 flex-shrink-0">
                                                                        <img
                                                                            src={getWalletTypeInfo(wallet.walletType).logoPath}
                                                                            alt={`${getWalletTypeInfo(wallet.walletType).name} logo`}
                                                                            className="max-w-full max-h-full object-contain"
                                                                        />
                                                                    </div>
                                                                    <span className="font-medium">{wallet.name}</span>
                                                                    <span className="ml-2 text-xs px-2 py-0.5 bg-blue-900 text-blue-300 rounded-full">
                                                                        {getWalletTypeInfo(wallet.walletType).name}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeWallet(wallet.id)}
                                                                    className="text-red-400 hover:text-red-300"
                                                                >
                                                                    <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>×</motion.span>
                                                                </button>
                                                            </div>
                                                            <div className="mt-1 bg-gray-800 p-2 rounded text-gray-300 font-mono text-sm break-all flex items-center">
                                                                <Shield className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                                                {wallet.address}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>


                            {/* Enhanced Step Indicator */}
                            <div className="flex justify-center mt-6">
                                <div className="flex items-center">
                                    <motion.div
                                        animate={{
                                            backgroundColor: step >= 1 ? '#3B82F6' : '#374151'
                                        }}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                                    >
                                        1
                                    </motion.div>

                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{
                                            scaleX: 1,
                                            backgroundColor: step > 1 ? '#3B82F6' : '#374151'
                                        }}
                                        className="w-10 h-1 origin-left"
                                    />

                                    <motion.div
                                        animate={{
                                            backgroundColor: step >= 2 ? '#3B82F6' : '#374151'
                                        }}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                                    >
                                        2
                                    </motion.div>

                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{
                                            scaleX: 1,
                                            backgroundColor: step > 2 ? '#3B82F6' : '#374151'
                                        }}
                                        className="w-10 h-1 origin-left"
                                    />

                                    <motion.div
                                        animate={{
                                            backgroundColor: step >= 3 ? '#3B82F6' : '#374151'
                                        }}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                                    >
                                        3
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Footer with Enhanced Buttons */}
                        <motion.div
                            className="p-6 border-t border-gray-700/50 bg-gray-800/40 backdrop-blur-sm flex-shrink-0"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <div className="flex space-x-4">
                                {step > 1 && (
                                    <motion.button
                                        whileHover={{ scale: 1.02, backgroundColor: "#4B5563" }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => setStep(step - 1)}
                                        className="flex-1 bg-gray-700 py-3 px-6 rounded-lg font-medium flex items-center justify-center group transition-colors"
                                    >
                                        <motion.div
                                            initial={{ x: 0 }}
                                            whileHover={{ x: -4 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                <path d="m15 18-6-6 6-6" />
                                            </svg>
                                        </motion.div>
                                        Back
                                    </motion.button>
                                )}

                                {step === 3 ? (
                                    <motion.button
                                        whileHover={{
                                            scale: 1.02,
                                            boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)"
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={handleSubmit}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 py-3 px-6 rounded-lg font-medium flex items-center justify-center relative overflow-hidden"
                                    >
                                        <div className="relative z-10 flex items-center">
                                            <Check className="w-5 h-5 mr-2" />
                                            Complete Setup
                                        </div>
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700"
                                            initial={{ x: "100%" }}
                                            whileHover={{ x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{
                                            scale: 1.02,
                                            boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)"
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={goToNextStep}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-6 rounded-lg font-medium flex items-center justify-center relative overflow-hidden"
                                    >
                                        <div className="relative z-10 flex items-center">
                                            Continue
                                            <motion.div
                                                initial={{ x: 0 }}
                                                whileHover={{ x: 4 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            >
                                                <ChevronRight className="w-5 h-5 ml-1" />
                                            </motion.div>
                                        </div>
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700"
                                            initial={{ x: "100%" }}
                                            whileHover={{ x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
};

export default BusinessSetupPopup;