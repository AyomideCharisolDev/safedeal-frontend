import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, LogOut, User, MapPin, Edit, Wallet, PlusCircle, Trash2, Save, X, Check, AlertTriangle, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../states';
import { uploadSingleImageToCloudinary } from '../../../utils/clouds';
import { makeRequest } from '../../../hook/useApi';
import { updateuserApi } from '../../../data/apis';
import { isSending, notifySuccess, notifyError } from '../../../utils/useutils';
import useUserAuthContext from '../../../hook/userUserAuthContext';
import { setCurrentUser } from '../../../states/userSlice';

// Types
type SocialMediaPlatform = 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'tiktok' | 'phone';
type WalletType = 'solflare' | 'metamask' | 'trustwallet' | 'phantom' | 'other';

interface ContactDetail {
    id: string;
    platform: SocialMediaPlatform;
    username: string;
}

interface WalletAddress {
    id: string;
    name: string;
    address: string;
    walletType?: WalletType;
}

interface UserProfile {
    businessDescription: string;
    firstName: string;
    lastName: string;
    location: string;
    profilePicture: string | null;
    contacts: ContactDetail[];
    wallets: WalletAddress[];
    businessName?: string;
}

const ProfilePage = ({ isMobile, isSidebarOpen }: any) => {
    const currentUser = useSelector((state: RootState) => state.user.currentUser);
    const { token, userLogout } = useUserAuthContext();
    const [activeTab, setActiveTab] = useState<'profile' | 'logout'>('profile');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState<any>(null);
    const [uploadPercentage, setUploadPercentage] = useState<number | null>(null);
    const dispatch = useDispatch();

    // Initialize profile from current user
    const [profile, setProfile] = useState<any>({
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || '',
        location: currentUser?.location || '',
        profilePicture: currentUser?.profilePicture,
        contacts: currentUser?.contacts || [],
        wallets: currentUser?.wallets || [],
        businessName: currentUser?.businessName
    });

    // Keep a copy of original profile for comparison
    const [originalProfile, setOriginalProfile] = useState<UserProfile>({ ...profile });

    const [editMode, setEditMode] = useState(false);
    const [newContact, setNewContact] = useState<Partial<ContactDetail>>({ platform: 'phone', username: '' });
    const [newWallet, setNewWallet] = useState<Partial<WalletAddress>>({ name: '', address: '', walletType: 'solflare' });

    const [showAddContact, setShowAddContact] = useState(false);
    const [showAddWallet, setShowAddWallet] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    // Update profile when currentUser changes
    useEffect(() => {
        if (currentUser) {
            const updatedProfile = {
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                location: currentUser.location || '',
                profilePicture: currentUser?.profilePicture,
                contacts: currentUser.contacts || [],
                wallets: currentUser.wallets || [],
                businessName: currentUser.businessName,
                businessDescription: currentUser.businessDescription || ''
            };
            setProfile(updatedProfile);
            setOriginalProfile(updatedProfile);
        }
    }, [currentUser]);

    // Check for changes between current profile and original
    useEffect(() => {
        const checkChanges = () => {
            if (image) return true;

            if (profile.firstName !== originalProfile.firstName) return true;
            if (profile.lastName !== originalProfile.lastName) return true;
            if (profile.location !== originalProfile.location) return true;
            if (profile.businessDescription !== originalProfile.businessDescription) return true;

            if (profile.contacts.length !== originalProfile.contacts.length) return true;
            if (profile.wallets.length !== originalProfile.wallets.length) return true;

            // Deep check contacts
            for (let i = 0; i < profile.contacts.length; i++) {
                const contact = profile.contacts[i];
                const originalContact = originalProfile.contacts.find(c => c.id === contact.id);
                if (!originalContact ||
                    originalContact.platform !== contact.platform ||
                    originalContact.username !== contact.username) {
                    return true;
                }
            }

            // Deep check wallets
            for (let i = 0; i < profile.wallets.length; i++) {
                const wallet = profile.wallets[i];
                const originalWallet = originalProfile.wallets.find(w => w.id === wallet.id);
                if (!originalWallet ||
                    originalWallet.name !== wallet.name ||
                    originalWallet.address !== wallet.address ||
                    originalWallet.walletType !== wallet.walletType) {
                    return true;
                }
            }

            return false;
        };

        setHasChanges(checkChanges());
    }, [profile, originalProfile, image]);

    // Validate profile based on account type
    const validateProfile = (): boolean => {
        const errors: string[] = [];

        if (profile.businessName === 'seller' || profile.businessName === 'both') {
            if (profile.contacts.length === 0) {
                errors.push('Sellers must have at least one contact method');
            }

            if (profile.wallets.length === 0) {
                errors.push('Sellers must have at least one wallet address');
            }
        }

        if (profile.firstName.trim() === '') {
            errors.push('First name is required');
        }

        if (profile.lastName.trim() === '') {
            errors.push('Last name is required');
        }

        if (profile.location.trim() === '') {
            errors.push('Location is required');
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    // Handle profile picture upload
    const handleProfilePictureUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfile((prev: any) => ({
                    ...prev,
                    profilePicture: e.target?.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Toggle edit mode
    const toggleEditMode = () => {
        if (editMode) {
            // If exiting edit mode, reset to original
            setProfile({ ...originalProfile });
            setImage(null);
            setValidationErrors([]);
        }
        setEditMode(!editMode);
        setShowAddContact(false);
        setShowAddWallet(false);
    };

    // Add new contact
    const addContact = () => {
        if (newContact.username && newContact.platform) {
            setProfile((prev: any) => ({
                ...prev,
                contacts: [
                    ...prev.contacts,
                    {
                        id: Date.now().toString(),
                        platform: newContact.platform as SocialMediaPlatform,
                        username: newContact.username as string
                    }
                ]
            }));
            setNewContact({ platform: 'phone', username: '' });
            setShowAddContact(false);
        }
    };

    // Remove contact
    const removeContact = (id: string) => {
        setProfile((prev: { contacts: any[]; }) => ({
            ...prev,
            contacts: prev.contacts.filter((contact: { id: string; }) => contact.id !== id)
        }));
    };
    // Add new wallet
    const addWallet = () => {
        if (newWallet.name && newWallet.address) {
            setProfile((prev: { wallets: any; }) => ({
                ...prev,
                wallets: [
                    ...prev.wallets,
                    {
                        id: Date.now().toString(),
                        name: newWallet.name as string,
                        address: newWallet.address as string,
                        walletType: newWallet.walletType as WalletType
                    }
                ]
            }));
            setNewWallet({ name: '', address: '', walletType: 'solflare' });
            setShowAddWallet(false);
        }
    };

    // Remove wallet
    const removeWallet = (id: string) => {
        setProfile((prev: { wallets: any[]; }) => ({
            ...prev,
            wallets: prev.wallets.filter((wallet: { id: string; }) => wallet.id !== id)
        }));
    };

    // Handle logout
    const handleLogout = () => {
        userLogout()
    };

    // Get platform icon and name
    const getPlatformInfo = (platform: SocialMediaPlatform) => {
        switch (platform) {
            case 'whatsapp': return { icon: '📱', name: 'WhatsApp' };
            case 'telegram': return { icon: '📬', name: 'Telegram' };
            case 'instagram': return { icon: '📸', name: 'Instagram' };
            case 'facebook': return { icon: '👥', name: 'Facebook' };
            case 'tiktok': return { icon: '🎵', name: 'TikTok' };
            case 'phone': return { icon: '📞', name: 'Phone' };
            default: return { icon: '🔗', name: 'Link' };
        }
    };

    // Get wallet icon and name
    const getWalletInfo = (walletType?: WalletType) => {
        switch (walletType) {
            case 'solflare': return { icon: '🌞', name: 'Solflare' };
            case 'metamask': return { icon: '🦊', name: 'MetaMask' };
            case 'trustwallet': return { icon: '🔐', name: 'Trust Wallet' };
            case 'phantom': return { icon: '👻', name: 'Phantom' };
            default: return { icon: '💼', name: 'Wallet' };
        }
    };

    // Format wallet address for display
    const formatAddress = (address: string): string => {
        if (address.length < 20) return address;
        return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
    };

    console.log(currentUser)

    // Save changes to database
    const saveChanges = async () => {
        // Validate before saving
        if (!validateProfile()) return;

        // Check if there are changes
        if (!hasChanges) {
            notifyError("No changes detected");
            return;
        }

        isSending(true, "Saving changes...");

        try {
            let imageObj = null;
            if (image) {
                setUploadPercentage(1);
                imageObj = await uploadSingleImageToCloudinary(image, (info) => {
                    setUploadPercentage(info.progress);
                });
            }

            const userData = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                location: profile.location,
                contacts: profile.contacts,
                wallets: profile.wallets,
                businessDescription: profile.businessDescription,
                ...(imageObj && { profilePicture: imageObj })
            };

            const { res, error } = await makeRequest(
                "POST",
                updateuserApi,
                userData,
                () => { isSending(false, "") },
                token,
                null,
                "urlencoded"
            );

            if (res) {
                localStorage.setItem('escrow_user', JSON.stringify(res?.data));
                dispatch(setCurrentUser(res?.data));
                notifySuccess("Profile updated successfully!");
                setEditMode(false);
                setOriginalProfile({ ...profile });
                setImage(null);
                setUploadPercentage(null);
            } else if (error) {
                notifyError(error || "Failed to update profile");
            }
        } catch (err) {
            console.error("Error saving profile:", err);
            notifyError("An error occurred while saving your profile");
            isSending(false, "");
        }
    };

    return (
        <div className="z-10 w-full mt-15 md:mt-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div
                className={`flex-1 ${isMobile ? "ml-0" : isSidebarOpen ? "md:ml-[240px]" : "ml-0"} px-6 md:px-20 mt-10 pb-10`}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-8xl md:pt-20"
                >
                    {/* Header */}
                    <div className="px-6 py-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-t-xl">
                        <h1 className="text-3xl font-bold">Account Settings</h1>
                        <p className="text-gray-200 mt-1">Manage your account preferences</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-700">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center px-6 py-4 font-medium transition-colors ${activeTab === 'profile'
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <User className="w-5 h-5 mr-2" />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('logout')}
                            className={`flex items-center px-6 py-4 font-medium transition-colors ${activeTab === 'logout'
                                ? 'text-red-400 border-b-2 border-red-400'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Logout
                        </button>
                    </div>

                    {/* Tab content */}
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' ? (
                                <motion.div
                                    key="profile-tab"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-semibold">Profile Information</h2>

                                        {/* Edit/Save/Cancel buttons */}
                                        <div className="flex space-x-3">
                                            {editMode ? (
                                                <>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={toggleEditMode}
                                                        className="px-4 py-2 rounded-lg flex items-center bg-gray-600 hover:bg-gray-700"
                                                    >
                                                        <X className="w-5 h-5 mr-2" />
                                                        Cancel
                                                    </motion.button>

                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={saveChanges}
                                                        disabled={!hasChanges}
                                                        className={`px-4 py-2 rounded-lg flex items-center ${hasChanges
                                                            ? 'bg-green-600 hover:bg-green-700'
                                                            : 'bg-green-800 opacity-60 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        <Save className="w-5 h-5 mr-2" />
                                                        Save Changes
                                                    </motion.button>
                                                </>
                                            ) : (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={toggleEditMode}
                                                    className="px-4 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <Edit className="w-5 h-5 mr-2" />
                                                    Edit Profile
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Validation errors */}
                                    <AnimatePresence>
                                        {validationErrors.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6"
                                            >
                                                <div className="flex items-start">
                                                    <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-medium text-red-400">Please fix the following issues:</h4>
                                                        <ul className="mt-1 ml-6 list-disc text-sm">
                                                            {validationErrors.map((error, index) => (
                                                                <li key={index} className="text-red-300">{error}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Account Type Banner */}
                                    <div className={`mb-6 p-4 rounded-lg bg-blue-900/30 border border-blue-600/50`}>
                                        <div className="flex items-center">
                                            <div className={`w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center`}>
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="ml-3 flex-grow">
                                                <h3 className="font-medium">
                                                    {profile.businessName}
                                                </h3>
                                                {editMode ? (
                                                    <motion.textarea
                                                        initial={{ scale: 0.98 }}
                                                        animate={{ scale: 1 }}
                                                        value={profile.businessDescription || ''}
                                                        onChange={(e) => setProfile({ ...profile, businessDescription: e.target.value })}
                                                        className="w-full bg-gray-700 rounded-lg px-4 py-2 mt-2 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                                        placeholder="Describe your business or services..."
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <p className="text-sm text-gray-300">
                                                        {profile.businessDescription || 'No business description provided'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {/* Profile Picture */}
                                        <div className="flex flex-col items-center">
                                            <div className="relative">
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    className="w-40 h-40 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center border-4 border-blue-500"
                                                >
                                                    {profile?.profilePicture ? (
                                                        <img
                                                            src={profile?.profilePicture?.secure_url}
                                                            alt="Profile"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-20 h-20 text-gray-500" />
                                                    )}
                                                </motion.div>

                                                {uploadPercentage !== null && uploadPercentage > 0 && (
                                                    <div className="mt-2">
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                            <div
                                                                className="bg-amber-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                                                                style={{ width: `${uploadPercentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-amber-600 mt-1 font-medium text-center">
                                                            Uploading... {Math.round(uploadPercentage)}%
                                                        </p>
                                                    </div>
                                                )}

                                                {editMode && (
                                                    <motion.button
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="absolute bottom-0 right-0 bg-blue-600 p-3 rounded-full shadow-lg"
                                                    >
                                                        <Camera className="w-5 h-5" />
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleProfilePictureUpload}
                                                            className="hidden"
                                                        />
                                                    </motion.button>
                                                )}
                                            </div>

                                            <h3 className="mt-4 text-xl font-semibold">
                                                {profile.firstName} {profile.lastName}
                                            </h3>

                                            <div className="flex items-center mt-1 text-gray-400">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                {profile.location}
                                            </div>
                                        </div>

                                        {/* Personal Information */}
                                        <div className="md:col-span-2">
                                            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                                                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-gray-400 text-sm mb-1">First Name</label>
                                                        {editMode ? (
                                                            <motion.input
                                                                initial={{ scale: 0.98 }}
                                                                animate={{ scale: 1 }}
                                                                type="text"
                                                                value={profile.firstName}
                                                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                                            />
                                                        ) : (
                                                            <div className="bg-gray-700 rounded-lg px-4 py-2">{profile.firstName}</div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-gray-400 text-sm mb-1">Last Name</label>
                                                        {editMode ? (
                                                            <motion.input
                                                                initial={{ scale: 0.98 }}
                                                                animate={{ scale: 1 }}
                                                                type="text"
                                                                value={profile.lastName}
                                                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                                            />
                                                        ) : (
                                                            <div className="bg-gray-700 rounded-lg px-4 py-2">{profile.lastName}</div>
                                                        )}
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-gray-400 text-sm mb-1">Location (Country)</label>
                                                        {editMode ? (
                                                            <motion.input
                                                                initial={{ scale: 0.98 }}
                                                                animate={{ scale: 1 }}
                                                                type="text"
                                                                readOnly
                                                                value={profile.location}
                                                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                                            />
                                                        ) : (
                                                            <div className="bg-gray-700 rounded-lg px-4 py-2">{profile.location}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Details */}
                                            <div className="bg-gray-800 rounded-xl p-6 mt-6 shadow-lg">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-semibold">Contact Details</h3>
                                                    {editMode && !showAddContact && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setShowAddContact(true)}
                                                            className="text-blue-400 flex items-center"
                                                        >
                                                            <PlusCircle className="w-4 h-4 mr-1" />
                                                            Add Contact
                                                        </motion.button>
                                                    )}
                                                </div>

                                                <AnimatePresence>
                                                    {showAddContact && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="bg-gray-700 rounded-lg p-4 mb-4 overflow-hidden"
                                                        >
                                                            <div className="flex justify-between items-center mb-2">
                                                                <h4 className="font-medium">Add New Contact</h4>
                                                                <button
                                                                    onClick={() => setShowAddContact(false)}
                                                                    className="text-gray-400 hover:text-white"
                                                                >
                                                                    <X className="w-5 h-5" />
                                                                </button>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <select
                                                                    value={newContact.platform}
                                                                    onChange={(e) => setNewContact({ ...newContact, platform: e.target.value as SocialMediaPlatform })}
                                                                    className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-600"
                                                                >
                                                                    <option value="phone">Phone</option>
                                                                    <option value="whatsapp">WhatsApp</option>
                                                                    <option value="telegram">Telegram</option>
                                                                    <option value="instagram">Instagram</option>
                                                                    <option value="facebook">Facebook</option>
                                                                    <option value="tiktok">TikTok</option>
                                                                </select>

                                                                <input
                                                                    type="text"
                                                                    placeholder="Username, Phone, or ID"
                                                                    value={newContact.username}
                                                                    onChange={(e) => setNewContact({ ...newContact, username: e.target.value })}
                                                                    className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-600"
                                                                />
                                                            </div>

                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={addContact}
                                                                className="mt-3 w-full bg-blue-600 py-2 rounded-lg font-medium"
                                                                disabled={!newContact.username || !newContact.platform}
                                                            >
                                                                Add Contact
                                                            </motion.button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {profile.contacts.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-400 bg-gray-750 rounded-lg border border-gray-700">
                                                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-2">
                                                            <User className="w-6 h-6 text-gray-500" />
                                                        </div>
                                                        <p>No contact details added yet</p>
                                                        {(profile.businessName === 'seller' || profile.businessName === 'both') && (
                                                            <p className="text-amber-400 text-sm mt-1">
                                                                Required for seller accounts
                                                            </p>
                                                        )}
                                                        {editMode && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => setShowAddContact(true)}
                                                                className="mt-3 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium"
                                                            >
                                                                <PlusCircle className="w-4 h-4 inline mr-1" />
                                                                Add Contact
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {profile.contacts.map((contact: { id: Key | null | undefined; platform: string; username: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }) => (
                                                            <motion.div
                                                                key={contact.id}
                                                                layout
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                className="bg-gray-700 rounded-lg px-4 py-3 flex justify-between items-center"
                                                            >
                                                                <div className="flex items-center">
                                                                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                                                                        <span className="text-lg">{getPlatformInfo(contact?.platform).icon}</span>
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium">{getPlatformInfo(contact?.platform).name}</div>
                                                                        <div className="text-gray-300 text-sm">{contact.username}</div>
                                                                    </div>
                                                                </div>

                                                                {editMode && (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => removeContact(contact.id)}
                                                                        className="text-red-400 hover:text-red-300 h-8 w-8 rounded-full flex items-center justify-center bg-gray-800"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </motion.button>
                                                                )}
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Wallet Addresses */}
                                            <div className="bg-gray-800 rounded-xl p-6 mt-6 shadow-lg">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-semibold">Wallet Addresses</h3>
                                                    {editMode && !showAddWallet && profile.wallets.length < 3 && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setShowAddWallet(true)}
                                                            className="text-blue-400 flex items-center"
                                                        >
                                                            <PlusCircle className="w-4 h-4 mr-1" />
                                                            Add Wallet
                                                        </motion.button>
                                                    )}
                                                </div>

                                                <AnimatePresence>
                                                    {showAddWallet && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="bg-gray-700 rounded-lg p-4 mb-4 overflow-hidden"
                                                        >
                                                            <div className="flex justify-between items-center mb-2">
                                                                <h4 className="font-medium">Add New Wallet</h4>
                                                                <button
                                                                    onClick={() => setShowAddWallet(false)}
                                                                    className="text-gray-400 hover:text-white"
                                                                >
                                                                    <X className="w-5 h-5" />
                                                                </button>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Wallet Name"
                                                                        value={newWallet.name}
                                                                        onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                                                                        className="w-full bg-gray-800 rounded-lg px-3 py-2 border border-gray-600"
                                                                    />

                                                                    <select
                                                                        value={newWallet.walletType}
                                                                        onChange={(e) => setNewWallet({ ...newWallet, walletType: e.target.value as WalletType })}
                                                                        className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-600"
                                                                    >
                                                                        <option value="solflare">Solflare</option>
                                                                        <option value="phantom">Phantom</option>
                                                                        <option value="metamask">MetaMask</option>
                                                                        <option value="trustwallet">Trust Wallet</option>
                                                                        <option value="other">Other</option>
                                                                    </select>
                                                                </div>

                                                                <input
                                                                    type="text"
                                                                    placeholder="Wallet Address"
                                                                    value={newWallet.address}
                                                                    onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                                                                    className="w-full bg-gray-800 rounded-lg px-3 py-2 border border-gray-600"
                                                                />
                                                            </div>

                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={addWallet}
                                                                className="mt-3 w-full bg-blue-600 py-2 rounded-lg font-medium"
                                                                disabled={!newWallet.name || !newWallet.address}
                                                            >
                                                                Add Wallet
                                                            </motion.button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {profile.wallets.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-400 bg-gray-750 rounded-lg border border-gray-700">
                                                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-2">
                                                            <Wallet className="w-6 h-6 text-gray-500" />
                                                        </div>
                                                        <p>No wallet addresses added yet</p>
                                                        {(profile.businessName === 'seller' || profile.businessName === 'both') && (
                                                            <p className="text-amber-400 text-sm mt-1">
                                                                Required for seller accounts
                                                            </p>
                                                        )}
                                                        {editMode && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => setShowAddWallet(true)}
                                                                className="mt-3 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium"
                                                            >
                                                                <PlusCircle className="w-4 h-4 inline mr-1" />
                                                                Add Wallet
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {profile.wallets.map((wallet: { id: Key | null | undefined; walletType: string | undefined; name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; address: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined; }) => (
                                                            <motion.div
                                                                key={wallet.id}
                                                                layout
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                className="bg-gray-700 rounded-lg p-4"
                                                            >
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <div className="flex items-center">
                                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center mr-3">
                                                                            <span className="text-lg">{getWalletInfo(wallet.walletType).icon}</span>
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium flex items-center">
                                                                                {wallet.name}
                                                                                {wallet.walletType && (
                                                                                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-600 rounded-full">
                                                                                        {getWalletInfo(wallet.walletType).name}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {editMode && (
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.1 }}
                                                                            whileTap={{ scale: 0.9 }}
                                                                            onClick={() => removeWallet(wallet.id)}
                                                                            className="text-red-400 hover:text-red-300 h-8 w-8 rounded-full flex items-center justify-center bg-gray-800"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </motion.button>
                                                                    )}
                                                                </div>

                                                                <div className="mt-2 bg-gray-800 p-3 rounded border border-gray-600 flex items-center justify-between">
                                                                    <div className="font-mono text-sm break-all text-gray-300 truncate mr-2">
                                                                        {wallet.address}
                                                                    </div>
                                                                    <button
                                                                        className="text-blue-400 hover:text-blue-300 flex-shrink-0 bg-gray-700 p-1.5 rounded-full"
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(wallet.address);
                                                                            notifySuccess("Address copied to clipboard");
                                                                        }}
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save Changes button at bottom for mobile */}
                                    {editMode && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="md:hidden mt-8 px-4"
                                        >
                                            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 p-4 border-t border-gray-800 z-10">
                                                <div className="flex space-x-3">
                                                    <motion.button
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={toggleEditMode}
                                                        className="px-4 py-3 rounded-lg flex-1 flex justify-center items-center bg-gray-700"
                                                    >
                                                        <X className="w-5 h-5 mr-2" />
                                                        Cancel
                                                    </motion.button>

                                                    <motion.button
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={saveChanges}
                                                        disabled={!hasChanges}
                                                        className={`px-4 py-3 rounded-lg flex-1 flex justify-center items-center ${hasChanges
                                                            ? 'bg-green-600'
                                                            : 'bg-green-800 opacity-60 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        <Save className="w-5 h-5 mr-2" />
                                                        Save Changes
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="logout-tab"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="py-10 flex flex-col items-center"
                                >
                                    <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
                                        <LogOut className="w-16 h-16 mx-auto text-red-400 mb-4" />
                                        <h2 className="text-2xl font-semibold mb-2">Ready to leave?</h2>
                                        <p className="text-gray-400 mb-6">
                                            You will be logged out of your account and redirected to the login page.
                                        </p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleLogout}
                                            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-medium w-full"
                                        >
                                            Logout
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage;