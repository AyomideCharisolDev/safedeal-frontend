import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    Info,
    DollarSign,
    Tag,
    User,
    Shield,
    ChevronRight,
    X,
    Upload,
    Link as LinkIcon,
    Check,
    Plus,
    Trash2,
    Clock,
    FileText,
    Calendar,
    AlertTriangle
} from 'lucide-react';
import { deleteImageFromCloudinary, uploadSingleImageToCloudinary, uploadToCloudinary } from '../../../utils/clouds';
import { notifyError, notifySuccess } from '../../../utils/useutils';
import { makeRequest } from '../../../hook/useApi';
import useUserAuthContext from '../../../hook/userUserAuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../states';
import { creatDealApi, getSellerDetailsApi } from '../../../data/apis';
import { setDeals } from '../../../states/dealSlice';
import { db } from '../../../dexieDB';
import { useNavigate } from 'react-router-dom';

interface Image {
    public_id: string;
    secure_url: string;
}

interface File {
    public_id: string;
    secure_url: string;
    name: string;
    type: string;
}

export default function CreateDeal() {
    const currentUser = useSelector((state: RootState) => state.user.currentUser); 
    const deals = useSelector((state: RootState) => state.deals.deals); 
    const [step, setStep] = useState(1);
    const [showPreview, setShowPreview] = useState(false);
    const [images, setImages] = useState<Image[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [uploadPercentage, setUploadPercentage] = useState<any>(null);
    const { token } = useUserAuthContext();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const Navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [sellerDetails, setSellerDetails] = useState<any>(null);
    const [isVerifyingSeller, setIsVerifyingSeller] = useState(false);
    const [showSellerConfirmation, setShowSellerConfirmation] = useState(false);
    const [dealId, setDealId] = useState('');
    const [formData, setFormData] = useState({
        title: 'Website Design Project',
        price: '500.00',
        currency: 'USDC',
        description: 'Complete redesign of company website including responsive layout, new branding elements, and integration with existing CMS.',
        secureId: '', // This will store the SecureDeal ID of the seller/freelancer
        duration: 14, // Duration in days instead of deadline date
        deliverables: [
            { description: 'Design mockups', completed: false },
            { description: 'Frontend implementation', completed: false },
            { description: 'Mobile responsiveness', completed: false }
        ]
    });

    useEffect(() => {
        setFormData((prev: any) => ({ ...prev, userId: currentUser?._id }))
    }, [currentUser])

    const [newDeliverable, setNewDeliverable] = useState({
        description: '',
        completed: false
    });

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

    const slideVariants = {
        hidden: { x: 50, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        },
        exit: {
            x: -50,
            opacity: 0,
            transition: { ease: "easeInOut" }
        }
    };

    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddDeliverable = () => {
        if (newDeliverable.description.trim()) {
            setFormData({
                ...formData,
                deliverables: [...formData.deliverables, { ...newDeliverable }]
            });
            setNewDeliverable({
                description: '',
                completed: false
            });
        }
    };

    const removeDeliverable = (index: number) => {
        const updatedDeliverables = [...formData.deliverables];
        updatedDeliverables.splice(index, 1);
        setFormData({
            ...formData,
            deliverables: updatedDeliverables
        });
    };

    const getSellerDetails = async () => {
        if (!formData.secureId.trim()) {
            notifyError('Please enter a valid SecureDeal ID');
            return;
        }

        setIsVerifyingSeller(true);
        try {
            const { res } = await makeRequest(
                "POST",
                getSellerDetailsApi,
                { secureId: formData.secureId },
                () => setIsVerifyingSeller(false),
                token
            );

            if (res && res.data) {
                setSellerDetails(res.data);
                setShowSellerConfirmation(true);
            } else {
                notifyError('Seller not found. Please check the SecureDeal ID.');
            }
        } catch (error) {
            notifyError('Failed to verify seller. Please try again.');
        } finally {
            setIsVerifyingSeller(false);
        }
    };

    const handleFileChange = async (e: any) => {
        if (e.target.files) {
            const file = e.target.files[0];
            setUploadPercentage(1); // Start progress
            try {
                const fileData = await uploadToCloudinary(file, (info) => {
                    setUploadPercentage(info.progress)
                });
                if (fileData) {
                    setFiles([...files, {
                        ...fileData,
                        name: file.name,
                        type: file.type
                    }]);
                    setUploadPercentage(null); // Reset progress after success
                }
            } catch (error) {
                setUploadPercentage(0); // Reset progress on error
                notifyError('Unable to upload file')
            } finally {
                setUploadPercentage(null); // Reset progress after success
            }
        }
    };

    const handleImageUpload = async (e: any) => {
        if (e.target.files) {
            const file = e.target.files[0];
            setUploadPercentage(1); // Start progress
            try {
                const image = await uploadSingleImageToCloudinary(file, (info) => {
                    setUploadPercentage(info.progress)
                });
                if (image) {
                    setImages([...images, image]);
                    setUploadPercentage(null); // Reset progress after success
                }
            } catch (error) {
                setUploadPercentage(0); // Reset progress on error
                notifyError('Unable to upload image')
            } finally {
                setUploadPercentage(null); // Reset progress after success
            }
        }
    };

    const removeImage = async (publicId: any) => {
        setIsDeleting(true)
        try {
            const isDeleted = await deleteImageFromCloudinary(publicId);
            if (isDeleted) {
                setImages(images.filter((img) => img.public_id !== publicId));
                setIsDeleting(false);
            }
        } catch (error) {
            notifyError('Unable to delete image');
            setIsDeleting(false)
        } finally {
            setIsDeleting(false)
        }
    };

    const removeFile = async (publicId: any) => {
        setIsDeleting(true)
        try {
            const isDeleted = await deleteImageFromCloudinary(publicId);
            if (isDeleted) {
                setFiles(files.filter((file) => file.public_id !== publicId));
                setIsDeleting(false);
            }
        } catch (error) {
            notifyError('Unable to delete file');
            setIsDeleting(false)
        } finally {
            setIsDeleting(false)
        }
    };

    const validateStep = (currentStep: number): boolean => {
        switch (currentStep) {
            case 1:
                // Validate basic details
                if (!formData.title.trim()) {
                    notifyError('Please enter a deal title');
                    return false;
                }
                if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
                    notifyError('Please enter a valid price');
                    return false;
                }
                if (!formData.description.trim()) {
                    notifyError('Please provide a description');
                    return false;
                }
                if (!formData.secureId.trim()) {
                    notifyError('Please enter the seller\'s SecureDeal ID');
                    return false;
                }
                if (!formData.duration || isNaN(parseInt(formData?.duration)) || parseInt(formData?.duration) <= 0) {
                    notifyError('Please set a valid duration for the deal');
                    return false;
                }
                return true;

            case 2:
                // Validate deliverables
                if (formData.deliverables.length === 0) {
                    notifyError('Please add at least one deliverable');
                    return false;
                }
                return true;

            case 3:
                // Validate agreement files (optional but recommended)
                // No strict validation needed, but show a warning if no agreement is uploaded
                if (files.length === 0) {
                    // This is just a warning, not blocking
                    notifyError('Warning: No agreement documents uploaded. This may affect dispute resolution.');
                }
                return true;

            case 4:
                // Final review, always valid
                return true;

            default:
                return true;
        }
    };

    const handleNext = () => {
        // Validate required fields before proceeding
        if (!validateStep(step)) {
            return;
        }

        if (step < 4) {
            setStep(step + 1);
        } else {
            submitDeal();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const submitDeal = async () => {
        if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
            return;
        }

        if (currentUser.secureId === formData.secureId) {
            notifyError('You cannot create a deal with your own Secure ID. Please enter the seller\'s Secure ID.');
            return;
        }

        await getSellerDetails();
    };

    const dispatch = useDispatch();


    const confirmAndSubmitDeal = async () => {
        setIsSubmitting(true);
        const dealData = {
            ...formData,
            images,
            files,
            createdAt: new Date().toISOString(),
            userId: currentUser?._id,
            from:currentUser?.businessName,
            to:sellerDetails?.businessName
        };

        const cb = () => { setIsSubmitting(false) };
        const { res } = await makeRequest("POST", creatDealApi, dealData, cb, token, null, "urlencoded");
        if (res) {
            notifySuccess("Deal created successfully! Waiting for seller to accept.");
            localStorage.removeItem('dealFormData');
            setDealId(res?.data?._id);
            const NewDeals = [res?.data, ...deals,] 
            dispatch(setDeals(NewDeals));
            await db.cached_data.put(NewDeals, `${currentUser?._id}_deals`)
            setShowPreview(true);
        }

        setShowSellerConfirmation(false);
    };



    useEffect(() => {
        loadFormDataFromLocalStorage();
    }, []);

    useEffect(() => {
        saveFormDataToLocalStorage();
    }, [formData, images, files, step]);

    const saveFormDataToLocalStorage = () => {
        localStorage.setItem('dealFormData', JSON.stringify({
            formData,
            images,
            files,
            step
        }));
    };

    const loadFormDataFromLocalStorage = () => {
        const savedData = localStorage.getItem('dealFormData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);

                // Only set states if the data exists
                if (parsedData.formData) setFormData(parsedData.formData);
                if (parsedData.images) setImages(parsedData.images);
                if (parsedData.files) setFiles(parsedData.files);
                if (parsedData.step) setStep(parsedData.step);
            } catch (error) {
                console.error("Error parsing saved form data:", error);
                // Optionally clear corrupted data
                localStorage.removeItem('dealFormData');
            }
        }
    };

    return (
        <div className="z-10 w-full mt-15 md:mt-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className={`flex-1 ${isMobile ? "ml-0" : isSidebarOpen ? "md:ml-[240px]" : "ml-0"} px-6 md:px-20 mt-10 pb-10`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-7xl bg-gay-800 mt-20 rounded-2xl shadoxl borer border-gray-00 p-6 md:p-8 z-10"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <span className="text-3xl bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent font-bold">
                                Create Deal
                            </span>
                            <p className="text-gray-400 mt-2">
                                Protect both buyer and seller with blockchain-secured transactions
                            </p>
                        </div>

                        {/* Steps indicator */}
                        <div className="flex items-center space-x-1 mt-4 md:mt-0">
                            {[1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    className="flex items-center"
                                    initial={false}
                                    animate={{ scale: step === i ? 1.1 : 1 }}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors
                                        ${step === i ? 'bg-purple-500 text-white' :
                                                step > i ? 'bg-green-500 text-white' : 'bg-gray-900 text-gray-300'}`}
                                    >
                                        {step > i ? <Check size={16} /> : i}
                                    </div>
                                    {i < 4 && (
                                        <div className={`w-6 h-1 ${step > i ? 'bg-green-500' : 'bg-gray-900'}`}></div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="relative"
                        >
                            {step === 1 && (
                                <motion.div variants={slideVariants} className="space-y-6">
                                    <motion.h3 variants={itemVariants} className="text-xl font-semibold text-gray-100 flex items-center">
                                        <Tag className="mr-2 text-blue-400" size={20} />
                                        Deal Details
                                    </motion.h3>

                                    <motion.div variants={itemVariants} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Deal Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="Enter a clear title for your deal"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <DollarSign size={18} className="text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="price"
                                                        value={formData.price}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                                                <select
                                                    name="currency"
                                                    value={formData.currency}
                                                    onChange={handleChange}
                                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                                                >
                                                    <option value="USDC">USDC</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                                                <User size={16} className="mr-2 text-purple-400" />
                                                Seller/Freelancer SecureDeal ID
                                            </label>
                                            <input
                                                type="text"
                                                name="secureId"
                                                value={formData.secureId}
                                                onChange={handleChange}
                                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="Enter the seller's SecureDeal ID"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">
                                                Ask the seller/freelancer for their SecureDeal ID to link this deal to their account
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                                                <Calendar size={16} className="mr-2 text-purple-400" />
                                                Deal Duration (Days)
                                            </label>
                                            <input
                                                type="number"
                                                name="duration"
                                                min="1"
                                                max="365"
                                                value={formData.duration}
                                                onChange={handleChange}
                                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">
                                                Number of days to complete the work. Deal countdown starts when payment is placed in escrow.
                                            </p>
                                        </div>


                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Deal Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={4}
                                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="Describe your deal in detail including scope, requirements, and expectations..."
                                            />
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div variants={slideVariants} className="space-y-6">
                                    <motion.h3 variants={itemVariants} className="text-xl font-semibold text-gray-100 flex items-center">
                                        <FileText className="mr-2 text-blue-400" size={20} />
                                        Deal Deliverables
                                    </motion.h3>

                                    <motion.div variants={itemVariants} className="space-y-5">
                                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                                            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                                                <Clock size={16} className="mr-2 text-purple-400" />
                                                Deliverables List
                                            </h4>

                                            {formData.deliverables.length > 0 ? (
                                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                                    {formData.deliverables.map((deliverable, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
                                                        >
                                                            <div className="flex items-center flex-1">
                                                                <div className="bg-gray-900 p-1.5 rounded-md">
                                                                    <FileText size={14} className="text-purple-400" />
                                                                </div>
                                                                <span className="ml-2 text-sm text-gray-200">{deliverable.description}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => removeDeliverable(index)}
                                                                className="p-1.5 hover:bg-gray-700 rounded-full"
                                                            >
                                                                <Trash2 size={14} className="text-gray-400 hover:text-red-400" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                                                    <FileText size={32} className="mb-2 opacity-50" />
                                                    <p className="text-sm">No deliverables added yet</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                                            <h4 className="text-sm font-medium text-gray-300 mb-3">Add New Deliverable</h4>
                                            <div className="flex items-end space-x-3">
                                                <div className="flex-1">
                                                    <label className="block text-xs text-gray-400 mb-1">Deliverable Description</label>
                                                    <input
                                                        type="text"
                                                        value={newDeliverable.description}
                                                        onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                                        placeholder="E.g. Logo design, content writing, delivery details,  etc."
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleAddDeliverable}
                                                    disabled={!newDeliverable.description.trim()}
                                                    className={`px-4 py-2 rounded-lg flex items-center space-x-1 text-sm
                                                    ${!newDeliverable.description.trim()
                                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                            : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
                                                >
                                                    <Plus size={14} />
                                                    <span>Add</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                                            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                                                <Info size={16} className="mr-2 text-blue-400" />
                                                Deliverables Tips
                                            </h4>
                                            <ul className="list-disc list-inside text-sm text-gray-400 space-y-2">
                                                <li>Be specific about what constitutes a completed deliverable</li>
                                                <li>Break down large projects into smaller, verifiable deliverables</li>
                                                <li>Specify formats, quality standards, or acceptance criteria</li>
                                                <li>Consider adding timeline milestones for complex projects</li>
                                            </ul>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div variants={slideVariants} className="space-y-6">
                                    <motion.h3 variants={itemVariants} className="text-xl font-semibold text-gray-100 flex items-center">
                                        <FileText className="mr-2 text-blue-400" size={20} />
                                        Agreement & Documentation
                                    </motion.h3>

                                    <motion.div variants={itemVariants} className="space-y-5">
                                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                                            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                                                <Upload size={16} className="mr-2 text-purple-400" />
                                                Upload Agreement Documents
                                            </h4>
                                            <p className="text-xs text-gray-400 mb-4">
                                                Upload any contracts, agreements, or reference documents that define the terms of this deal
                                            </p>

                                            <div className="space-y-4">
                                                {/* File upload area */}
                                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                                                    <input
                                                        type="file"
                                                        id="agreement-upload"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor="agreement-upload"
                                                        className="cursor-pointer flex flex-col items-center justify-center py-4"
                                                    >
                                                        <Upload size={32} className="text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-300 font-medium">Click to upload document</p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            PDF, DOC, DOCX, TXT (Max 10MB)
                                                        </p>
                                                    </label>
                                                </div>

                                                {/* Upload progress */}
                                                {uploadPercentage !== null && (
                                                    <div className="w-full bg-gray-900 rounded-full h-2">
                                                        <div
                                                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${uploadPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                )}

                                                {/* Files list */}
                                                {files.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        <h5 className="text-sm font-medium text-gray-300">Uploaded Files</h5>
                                                        <div className="max-h-48 overflow-y-auto space-y-2">
                                                            {files.map((file, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between bg-gray-800 p-2 rounded-lg"
                                                                >
                                                                    <div className="flex items-center">
                                                                        <div className="bg-purple-500/20 p-2 rounded-md">
                                                                            <FileText size={16} className="text-purple-400" />
                                                                        </div>
                                                                        <div className="ml-2">
                                                                            <p className="text-sm text-gray-200 truncate max-w-xs">{file.name}</p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => removeFile(file.public_id)}
                                                                        disabled={isDeleting}
                                                                        className="p-1.5 hover:bg-gray-700 rounded-full"
                                                                    >
                                                                        <Trash2 size={14} className="text-gray-400 hover:text-red-400" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                                            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                                                <Camera size={16} className="mr-2 text-purple-400" />
                                                Reference Images (Optional)
                                            </h4>
                                            <p className="text-xs text-gray-400 mb-4">
                                                Upload any design references, examples, or visual specifications for the project
                                            </p>
                                            <div className="space-y-4">
                                                {/* Image upload area */}
                                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                                                    <input
                                                        type="file"
                                                        id="image-upload"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                        accept="image/*"
                                                    />
                                                    <label
                                                        htmlFor="image-upload"
                                                        className="cursor-pointer flex flex-col items-center justify-center py-4"
                                                    >
                                                        <Camera size={32} className="text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-300 font-medium">Click to upload images</p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            PNG, JPG, GIF (Max 5MB)
                                                        </p>
                                                    </label>
                                                </div>

                                                {/* Images grid */}
                                                {images.length > 0 && (
                                                    <div className="mt-4">
                                                        <h5 className="text-sm font-medium text-gray-300 mb-2">Uploaded Images</h5>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                            {images.map((image, index) => (
                                                                <div key={index} className="relative group">
                                                                    <img
                                                                        src={image?.secure_url}
                                                                        alt={`Reference ${index + 1}`}
                                                                        className="h-24 w-full object-cover rounded-lg"
                                                                    />
                                                                    <button
                                                                        onClick={() => removeImage(image?.public_id)}
                                                                        disabled={isDeleting}
                                                                        className="absolute top-1 right-1 bg-gray-900/70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <X size={14} className="text-white" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div variants={slideVariants} className="space-y-6">
                                    <motion.h3 variants={itemVariants} className="text-xl font-semibold text-gray-100 flex items-center">
                                        <Shield className="mr-2 text-blue-400" size={20} />
                                        Review & Create Deal
                                    </motion.h3>

                                    <motion.div variants={itemVariants} className="space-y-5">
                                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                                            <h4 className="text-sm font-medium text-gray-300 mb-3">Deal Summary</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Title:</span>
                                                    <span className="text-gray-200 font-medium">{formData.title}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Price:</span>
                                                    <span className="text-gray-200 font-medium">{formData.price} {formData.currency}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Seller ID:</span>
                                                    <span className="text-gray-200 font-medium">{formData.secureId}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Duration:</span>
                                                    <span className="text-gray-200 font-medium">{formData.duration} days</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Deliverables:</span>
                                                    <span className="text-gray-200 font-medium">{formData.deliverables.length} items</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Documents:</span>
                                                    <span className="text-gray-200 font-medium">{files.length} files</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Images:</span>
                                                    <span className="text-gray-200 font-medium">{images.length} images</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                                            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                                                <AlertTriangle size={16} className="mr-2 text-yellow-400" />
                                                Important Notes
                                            </h4>
                                            <ul className="list-disc list-inside text-sm text-gray-400 space-y-2">
                                                <li>Once created, the deal will be sent to the seller for approval</li>
                                                <li>Funds will be held in escrow until deliverables are confirmed</li>
                                                <li>Both parties must agree to any changes after creation</li>
                                                <li>Disputes will be resolved through our arbitration process</li>
                                            </ul>
                                        </div>

                                        <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <div className="shrink-0">
                                                    <Shield size={20} className="text-purple-400" />
                                                </div>
                                                <div className="ml-3">
                                                    <h5 className="text-sm font-medium text-purple-200">Secure Payment Protection</h5>
                                                    <p className="text-xs text-purple-300 mt-1">
                                                        Your payment will be securely held in smart contract escrow until you confirm the deliverables are complete.
                                                        No more payment anxiety or trust issues.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Form Navigation */}
                    <div className="mt-8 flex justify-between">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className={`px-5 py-2.5 rounded-lg flex items-center text-sm
                            ${step === 1
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                        >
                            Back
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={isVerifyingSeller}
                            className={`px-5 py-2.5 rounded-lg flex items-center text-sm bg-gradient-to-r 
                            ${step === 4
                                    ? 'from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800'
                                    : 'from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700'} text-white`}
                        >
                            {isVerifyingSeller ? (
                                <>
                                    <span className="loader mr-2"></span>
                                    Processing...
                                </>
                            ) : step === 4 ? (
                                <>
                                    Create Deal
                                    <Check size={16} className="ml-2" />
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ChevronRight size={16} className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Success Preview */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/90"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 shadow-xl max-w-lg w-full border border-gray-700"
                        >
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                                    <Check size={32} className="text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-100 mb-2">Deal Created Successfully!</h3>
                                <p className="text-gray-400">
                                    Your secure deal has been created and is waiting for the seller to accept.
                                </p>
                            </div>

                            <div className="border border-gray-700 rounded-lg p-4 mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Deal ID:</span>
                                    <span className="text-gray-200 font-mono">{dealId}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Status:</span>
                                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">Pending Approval</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Seller:</span>
                                    <span className="text-gray-200">{formData.secureId}</span>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={() =>Navigate(`/dashboard/deals/${dealId}`)}
                                    className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium"
                                >
                                    View Deal Details
                                </button>
                                <button
                                    onClick={() => Navigate('/dashboard')}
                                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-lg font-medium"
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSellerConfirmation && sellerDetails && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/90"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 shadow-xl max-w-lg w-full border border-gray-700"
                        >
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 overflow-hidden">
                                    {sellerDetails?.profilePicture?.secure_url ? (
                                        <img
                                            src={sellerDetails?.profilePicture?.secure_url}
                                            alt={sellerDetails?.businessName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-blue-500/20 flex items-center justify-center">
                                            <User size={32} className="text-blue-400" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-100 mb-2">Confirm Seller Details</h3>
                                <p className="text-gray-400">
                                    Please verify the seller information before creating the deal.
                                </p>
                            </div>

                            <div className="border border-gray-700 rounded-lg p-4 mb-6">
                                <div className="flex justify-between text-sm mb-3">
                                    <span className="text-gray-400">Seller ID:</span>
                                    <span className="text-gray-200 font-mono">{sellerDetails?.secureId}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-3">
                                    <span className="text-gray-400">Business Name:</span>
                                    <span className="text-gray-200">{sellerDetails?.businessName}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-3">
                                    <span className="text-gray-400">Busness Owner's Name:</span>
                                    <span className="text-gray-200">{sellerDetails?.firstName + "  " + sellerDetails?.lastName || sellerDetails.username}</span>
                                </div>
                                {sellerDetails.email && (
                                    <div className="flex justify-between text-sm mb-3">
                                        <span className="text-gray-400">Email:</span>
                                        <span className="text-gray-200">{sellerDetails.email}</span>
                                    </div>
                                )}
                                {sellerDetails.rating && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Rating:</span>
                                        <div className="flex items-center">
                                            <span className="text-yellow-400 mr-1">★</span>
                                            <span className="text-gray-200">{sellerDetails.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={confirmAndSubmitDeal}
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="loader mr-2"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                           Accept and Create Deal
                                            <Check size={16} className="ml-2" />
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowSellerConfirmation(false)}
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}