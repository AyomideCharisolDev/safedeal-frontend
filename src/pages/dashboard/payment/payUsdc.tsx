// src/SecureDealPayment.tsx
import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    createTransferInstruction,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { isSending } from '../../../utils/useutils';

// Get environment variables
const USDC_MINT_ADDRESS = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
// const PAYMENT_AMOUNT = import.meta.env.VITE_PAYMENT_AMOUNT || "1";
const RECIPIENT_ADDRESS = import.meta.env.VITE_RECIPIENT_ADDRESS || "3E4kKNEfZVvhh8yAUjJa4brtWCQ7UUCoFePDbKHLb4Eq";

interface PaymentResult {
    success: boolean;
    txHash?: string;
    amount?: string;
    sender?: string;
    recipient?: string;
    timestamp?: number;
    error?: string;
}

const SecureDealPayment = ({deal}:any) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, disconnect } = useWallet();
    const PAYMENT_AMOUNT:any = 1

    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [txSignature, setTxSignature] = useState('');
    const [usdcBalance, setUsdcBalance] = useState(0);
    const [solBalance, setSolBalance] = useState(0);
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

    // Function to get both SOL and USDC balances
    const getBalances = async () => {
        if (!publicKey) return;

        try {
            setIsLoading(true);
            setStatus('');

            // Get SOL balance
            const solBal = await connection.getBalance(publicKey);
            setSolBalance(solBal / LAMPORTS_PER_SOL);

            // Get USDC balance
            const tokenAccount = await getAssociatedTokenAddress(
                USDC_MINT_ADDRESS,
                publicKey
            );

            try {
                const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccount);
                setUsdcBalance(Number(tokenAccountInfo.value.uiAmount));
            } catch (e) {
                // Token account might not exist yet
                setUsdcBalance(0);
            }
        } catch (err) {
            console.error('Error fetching balances:', err);
            setStatus('Failed to fetch balances');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle USDC payment
    const handleSendUSDC = async () => {
        if (!publicKey || !RECIPIENT_ADDRESS) {
            setStatus('Please connect wallet');
            return;
        }

        try {
            setIsLoading(true);
            setStatus('Processing payment...')
            setTxSignature('');
            setPaymentResult(null);

            // Verify the recipient address
            let recipientPubkey;
            try {
                recipientPubkey = new PublicKey(RECIPIENT_ADDRESS);
            } catch (err) {
                setStatus('Invalid recipient address in configuration');
                setIsLoading(false);
                isSending(false, "")
                return;
            }

            // Convert amount to proper decimals (USDC has 6 decimals)
            const amountInSmallestUnit = Math.floor(parseFloat(PAYMENT_AMOUNT) * 1_000_000);

            // Check if user has enough balance
            if (parseFloat(PAYMENT_AMOUNT) > usdcBalance) {
                setStatus(`Insufficient USDC balance. You need ${PAYMENT_AMOUNT} USDC but only have ${usdcBalance.toFixed(2)} USDC.`);
                setIsLoading(false);
                isSending(false, "")
                return;
            }

            // Get the source token account (sender's USDC account)
            const senderTokenAccount = await getAssociatedTokenAddress(
                USDC_MINT_ADDRESS,
                publicKey
            );

            // Get or create the destination token account (recipient's USDC account)
            const destinationTokenAccount = await getAssociatedTokenAddress(
                USDC_MINT_ADDRESS,
                recipientPubkey
            );

            let transaction = new Transaction();

            // Check if the destination token account exists, if not create it
            try {
                const accountInfo = await connection.getAccountInfo(destinationTokenAccount);
                if (!accountInfo) {
                    transaction.add(
                        createAssociatedTokenAccountInstruction(
                            publicKey, // payer
                            destinationTokenAccount, // associated token account address
                            recipientPubkey, // owner
                            USDC_MINT_ADDRESS, // mint
                            TOKEN_PROGRAM_ID,
                            ASSOCIATED_TOKEN_PROGRAM_ID
                        )
                    );
                }
            } catch (error) {
                // Create the account if it doesn't exist
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey, // payer
                        destinationTokenAccount, // associated token account address
                        recipientPubkey, // owner
                        USDC_MINT_ADDRESS, // mint
                        TOKEN_PROGRAM_ID,
                        ASSOCIATED_TOKEN_PROGRAM_ID
                    )
                );
            }

            // Add the token transfer instruction
            transaction.add(
                createTransferInstruction(
                    senderTokenAccount, // source
                    destinationTokenAccount, // destination
                    publicKey, // owner of source
                    amountInSmallestUnit, // amount
                    [], // multiSigners
                    TOKEN_PROGRAM_ID // programId
                )
            );

            // Send the transaction
            const signature = await sendTransaction(transaction, connection);

            // Wait for confirmation
            await connection.confirmTransaction(signature, 'confirmed');

            setTxSignature(signature);
            setStatus('Payment successful!');

            // Create the payment result object to be sent to backend
            const result: PaymentResult = {
                success: true,
                txHash: signature,
                amount: PAYMENT_AMOUNT,
                sender: publicKey.toString(),
                recipient: RECIPIENT_ADDRESS,
                timestamp: Date.now()
            };

            setPaymentResult(result);

            // Update balance after transaction
            getBalances();

        } catch (err) {
            console.error('Error processing USDC payment:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setStatus(`Payment failed: ${errorMessage}`);

            setPaymentResult({
                success: false,
                error: errorMessage,
                sender: publicKey.toString(),
                recipient: RECIPIENT_ADDRESS,
                amount: PAYMENT_AMOUNT,
                timestamp: Date.now()
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = () => {
        disconnect();
        setStatus('');
        setTxSignature('');
        setPaymentResult(null);
    };

    // Refresh balance when wallet connects or modal opens
    useEffect(() => {
        if (publicKey && isOpen) {
            getBalances();
        }
    }, [publicKey, isOpen, connection]);

    // Modal animation variants
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 20, stiffness: 300 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    return (
        <>
            {/* Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className={`w-full py-3 rounded-lg flex items-center justify-center text-white font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Make Secure Payment
            </motion.button>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed w-full p-3 md:p-0 h-full top-0 left-0 inset-0 bg-black/80 bg-opacity-70  flex items-center justify-center z-50">
                        {/* Modal Content */}
                        <motion.div
                            className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* Header */}
                            <div className="b-r from-purple-600 to-blue-500 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-md font-bold text-white">Make Payment</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-4 ">
                                {!publicKey ? (
                                    <div className="flex flex-col items-cente justify-center py-6">
                                        <p className="text-gray-300 mb-4 text-cener">Connect your wallet to make a secure USDC payment</p>
                                        <WalletMultiButton className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300" />
                                    </div>
                                ) : (
                                    <div>
                                        {/* Connection Info */}
                                        <div className="mb-4 flex justify-between items-center">
                                            <div className="text-gray-300 text-sm truncate max-w-[200px]">
                                                Connected: {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
                                            </div>
                                            <button
                                                onClick={handleDisconnect}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                Disconnect
                                            </button>
                                        </div>

                                        {/* Balances Display */}
                                        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-sm font-medium text-gray-300 mb-2">Your Balances</h4>
                                            <div className="flex justify-between">
                                                <div className="flex items-center">
                                                    <div className="h-6 w-6 rounded-full from-purple-600 to-purple-800 mr-2 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src="https://img.icons8.com/?size=100&id=NgbFFSOCkrnB&format=png&color=ffffff"
                                                            alt="SOL"
                                                            className="h-5 w-5 object-contain"
                                                        />
                                                    </div>
                                                    <span className="text-gray-300">{solBalance.toFixed(4)} SOL</span>
                                                </div>
                                                <div className="flex items-center">
                                                <div className="h-6 w-6 rounded-full text-white  mr-2 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src="https://img.icons8.com/?size=100&id=1jPxlShNofZt&format=png&color=ffffff"
                                                            alt="SOL"
                                                            className="h-5 w-5 text-white object-contain"
                                                        />
                                                    </div>
                                                    <span className="text-gray-300">{usdcBalance.toFixed(2)} USDC</span>
                                                </div>
                                                <motion.button
                                                    type="button"
                                                    onClick={getBalances}
                                                    className="text-xs text-blue-400 hover:text-blue-300"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    Refresh
                                                </motion.button>
                                            </div>
                                        </div>

                                        {/* Payment Info */}
                                        <div className="mb-6 p-3 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-sm font-medium text-gray-300 mb-2">Payment Details</h4>
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Amount:</span>
                                                    <span className="text-white text-xs font-medium">{PAYMENT_AMOUNT} USDC</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">for:</span>
                                                    <span className="text-white text-xs font-medium truncate max-w-[200px]">
                                                        {deal?.title || 'SecureDeal Payment'}
                                                    </span>
                                                </div>
                                            </div>

                                            {parseFloat(PAYMENT_AMOUNT) > usdcBalance && (
                                                <div className="mt-2 text-xs text-red-400 bg-red-900 bg-opacity-30 p-2 rounded">
                                                    Insufficient balance. You only have {usdcBalance.toFixed(2)} USDC.
                                                </div>
                                            )}
                                        </div>

                                        {status && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`mb-4 p-3 rounded-md ${status.includes('failed') || status.includes('Error') || status.includes('Invalid') || status.includes('Insufficient') || status.includes('Failed')
                                                        ? 'bg-red-900 bg-opacity-30 text-red-400 border border-red-800'
                                                        : status.includes('successful')
                                                            ? 'bg-green-900 bg-opacity-30 text-green-400 border border-green-800'
                                                            : 'bg-blue-900 bg-opacity-30 text-blue-400 border border-blue-800'
                                                    }`}
                                            >
                                                {status}

                                                {txSignature && (
                                                    <div className="mt-2">
                                                        <a
                                                            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-400 underline text-sm hover:text-blue-300"
                                                        >
                                                            View on Solana Explorer
                                                        </a>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {/* Payment Result - would be sent to backend */}
                                        {paymentResult && paymentResult.success && (
                                            <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                                                <h4 className="text-sm font-medium text-green-400 mb-2">Transaction Details (For Backend)</h4>
                                                <pre className="text-xs text-gray-400 overflow-x-auto bg-gray-900 p-2 rounded">
                                                    {JSON.stringify(paymentResult, null, 2)}
                                                </pre>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center">
                                            <motion.button
                                                type="button"
                                                onClick={() => setIsOpen(false)}
                                                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Cancel
                                            </motion.button>
                                            <motion.button
                                                type="button"
                                                onClick={handleSendUSDC}
                                                disabled={isLoading || parseFloat(PAYMENT_AMOUNT) <= 0 || parseFloat(PAYMENT_AMOUNT) > usdcBalance || !RECIPIENT_ADDRESS}
                                                className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-md ${isLoading || parseFloat(PAYMENT_AMOUNT) <= 0 || parseFloat(PAYMENT_AMOUNT) > usdcBalance || !RECIPIENT_ADDRESS
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:from-purple-700 hover:to-blue-600'
                                                    } transition-all`}
                                                whileHover={
                                                    isLoading || parseFloat(PAYMENT_AMOUNT) <= 0 || parseFloat(PAYMENT_AMOUNT) > usdcBalance || !RECIPIENT_ADDRESS
                                                        ? {}
                                                        : { scale: 1.05 }
                                                }
                                                whileTap={
                                                    isLoading || parseFloat(PAYMENT_AMOUNT) <= 0 || parseFloat(PAYMENT_AMOUNT) > usdcBalance || !RECIPIENT_ADDRESS
                                                        ? {}
                                                        : { scale: 0.95 }
                                                }
                                            >
                                                {isLoading ? (
                                                    <div className="flex items-center">
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Processing...
                                                    </div>
                                                ) : `Pay ${PAYMENT_AMOUNT} USDC`}
                                            </motion.button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {/* <div className="bg-gray-800 px-6 py-3 flex items-center justify-center">
                                <div className="flex items-center text-sm text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Secured by SecureDeal
                                </div>
                            </div> */}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SecureDealPayment;