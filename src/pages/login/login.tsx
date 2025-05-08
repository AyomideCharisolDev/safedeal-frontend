import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { makeRequest } from '../../hook/useApi';
import { sendCodeApi, loginApi } from '../../data/apis';
import { notifyError, notifySuccess } from '../../utils/useutils';
import { useDispatch } from 'react-redux';
import { setCurrentUser } from '../../states/userSlice';

interface LoginFormData {
  email: string;
  password: string;
  verificationCode: string;
}

const LoginPage = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    verificationCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      notifyError("Please enter an email address and password");
      return;
    }
    setIsSending(true);
    const cb = () => { setIsSending(false); };
    const { res } = await makeRequest('POST', sendCodeApi, { email: formData.email, password:formData.password, action:"login" }, cb, null, null);
    if (res) {
      setCodeSent(true);
      notifySuccess("Verification code sent to your email");
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.verificationCode) {
      notifyError("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    const cb = () => { setIsLoading(false); };
    const { res } = await makeRequest("POST", loginApi, formData, cb, null, null);
    if (res) {
      localStorage.setItem('sol_escrow', res.jwt);
      localStorage.setItem('escrow_user', JSON.stringify(res.user));
      dispatch(setCurrentUser(res?.user));
      notifySuccess("Login successful");
      window.location.reload() 
    }
  };

  // Handle navigation to signup page
  const handleNavigateToSignup = () => {
    navigate('/signup');
  };

  // Handle back to home
  const handleBackToHome = () => {
    navigate('/');
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
        className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-8 sm:px-10">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
            <p className="text-indigo-300 text-center mb-8">Log in to access your account</p>
          </motion.div>

          <form onSubmit={handleSubmit} autoComplete='off'>
            <div className="space-y-6">
              {/* Email Field */}
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
                    placeholder="Enter your password"
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
                <div className="flex justify-between text-xs">
                  <span className="text-indigo-300 hover:text-indigo-200 cursor-pointer">
                    Forgot password?
                  </span>
                </div>
              </motion.div>

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
                    {isSending ? (
                      <div className="flex items-center space-x-1">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending</span>
                      </div>
                    ) : "Get OTP"}
                  </motion.button>

              {/* OTP Field */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="verificationCode" className="block text-sm font-medium text-indigo-200">
                  Verification Code (OTP)
                </label>
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  required
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-700 border ${codeSent ? 'border-green-500' : 'border-indigo-500'} rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                  placeholder="Enter the OTP sent to your email"
                />
                {codeSent && (
                  <motion.p 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="text-xs text-green-400"
                  >
                    OTP sent to your email
                  </motion.p>
                )}
              </motion.div>

              {/* Login Button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg px-4 py-3 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Logging in...</span>
                    </div>
                  ) : "Log In"}
                </motion.button>
              </motion.div>
            </div>
          </form>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <a 
                onClick={handleNavigateToSignup}
                className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Sign up
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;