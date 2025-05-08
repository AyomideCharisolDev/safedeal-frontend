import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import countryList from 'react-select-country-list';
import { Link, useNavigate } from 'react-router-dom';
import { makeRequest } from '../../hook/useApi';
import { sendCodeApi, signupApi } from '../../data/apis';
import { notifyError, notifySuccess } from '../../utils/useutils';

// Define types for our form data
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  location: string;
  verificationCode: string;
}

// Password strength criteria
interface PasswordStrength {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const SignUpPage = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    location: '',
    verificationCode: '',
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const Navigate = useNavigate();

  // Get country options with flags
  const countries = countryList().getData().map((country) => ({
    value: country.value,
    label: country.label,
  }));

  // Check password strength
  useEffect(() => {
    const strength = {
      hasMinLength: formData.password.length >= 8,
      hasUpperCase: /[A-Z]/.test(formData.password),
      hasLowerCase: /[a-z]/.test(formData.password),
      hasNumber: /[0-9]/.test(formData.password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password),
    };
    setPasswordStrength(strength);
  }, [formData.password]);

  // Calculate overall password strength
  const getPasswordStrengthPercentage = () => {
    const criteria = Object.values(passwordStrength);
    const metCriteria = criteria.filter(Boolean).length;
    return (metCriteria / criteria.length) * 100;
  };

  const getPasswordStrengthLabel = () => {
    const percentage = getPasswordStrengthPercentage();
    if (percentage === 0) return '';
    if (percentage <= 20) return 'Very Weak';
    if (percentage <= 40) return 'Weak';
    if (percentage <= 60) return 'Medium';
    if (percentage <= 80) return 'Strong';
    return 'Very Strong';
  };

  const getPasswordStrengthColor = () => {
    const percentage = getPasswordStrengthPercentage();
    if (percentage <= 20) return 'bg-red-500';
    if (percentage <= 40) return 'bg-orange-500';
    if (percentage <= 60) return 'bg-yellow-500';
    if (percentage <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle sending verification code
  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      notifyError("enter email address")
      return
    }
    setIsSending(true)
    const cb = () => { setIsSending(false) }
    const { res } = await makeRequest('POST', sendCodeApi, { email: formData.email, action:"signup" }, cb, null, null);
    if (res) {
      setCodeSent(true);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allCriteriaMet = Object.values(passwordStrength).every(Boolean);
    if (!allCriteriaMet) {
      notifyError("Password does not meet all requirements");
      return;
    }
    setIsLoading(true);
    const cb = () => { setIsLoading(false) };
    const { res } = await makeRequest("POST", signupApi, formData, cb, null, null);
    if(res) {
      notifySuccess("account created successfully")
      Navigate('/login')
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    Navigate('/')
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex items-center justify-center px-4 py-8 relative">
      {/* Back to Home Button */}
      <motion.button
        onClick={handleBackToHome}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        className="absolute top-0 mt-10 left-6 flex items-center cursor-pointer text-white font-medium rounded-lg px-10 py-2 transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to Home
      </motion.button>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-lg bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-8 sm:px-10">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-center text-white mb-2">Create an account</h2>
            <p className="text-indigo-300 text-center mb-8">Secure transactions, Guaranteed Delivery</p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">

            <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-indigo-200">
                  Country
                </label>
                <div className="w-full">
                  <select
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleSelectChange}
                    className="w-full bg-gray-700 border border-indigo-500 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.value} value={country.label}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-indigo-200">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-indigo-500 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Your first name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-indigo-200">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-indigo-500 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Your last name"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-indigo-200">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-indigo-500 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password strength progress bar */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-indigo-300">Password Strength:</span>
                      <span className="text-xs font-medium text-indigo-200">
                        {getPasswordStrengthLabel()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                        style={{ width: `${getPasswordStrengthPercentage()}%` }}
                      ></div>
                    </div>

                    {/* Password requirements */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <span className={`text-xs ${passwordStrength.hasMinLength ? 'text-green-400' : 'text-gray-400'}`}>
                          {passwordStrength.hasMinLength ? '✓' : '○'} At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs ${passwordStrength.hasUpperCase ? 'text-green-400' : 'text-gray-400'}`}>
                          {passwordStrength.hasUpperCase ? '✓' : '○'} At least one uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs ${passwordStrength.hasLowerCase ? 'text-green-400' : 'text-gray-400'}`}>
                          {passwordStrength.hasLowerCase ? '✓' : '○'} At least one lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs ${passwordStrength.hasNumber ? 'text-green-400' : 'text-gray-400'}`}>
                          {passwordStrength.hasNumber ? '✓' : '○'} At least one number
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs ${passwordStrength.hasSpecialChar ? 'text-green-400' : 'text-gray-400'}`}>
                          {passwordStrength.hasSpecialChar ? '✓' : '○'} At least one special character
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

             

              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-indigo-200">
                  Email
                </label>
                <div className="flex space-x-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="flex-1 bg-gray-700 border border-indigo-500 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Your email address"
                  />
                  <motion.button
                    type="button"
                    onClick={handleSendVerificationCode}
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    disabled={isSending}
                    className="bg-indigo-600 text-white font-medium rounded-lg px-3 py-2 transition-all duration-300 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSending ? "Please Wait..." : "Get Verification Code"}
                  </motion.button>
                </div>
              </motion.div>

              

              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="verificationCode" className="block text-sm font-medium text-indigo-200">
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  required
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-700 border ${codeSent ? 'border-green-500' : 'border-indigo-500'} rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                  placeholder="Enter the code sent to your email"
                />
                {codeSent && (
                  <p className="text-xs text-green-400">Verification code sent to your email</p>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  disabled={isloading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg px-4 py-3 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isloading ? "Please Wait..." : "Sign Up"}
                </motion.button>
              </motion.div>
            </div>
          </form>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;