const baseUrl = "http://localhost:4000/api/v1";
// const baseUrl = "https://adesina-revemp-be.onrender.com/api/v1";

const sendCodeApi = `${baseUrl}/user/sendOtp`;
const signupApi = `${baseUrl}/user/signup`;
const loginApi = `${baseUrl}/user/login`;
const logoutApi = `${baseUrl}/user/logout`;
const getCurrentUserApi = `${baseUrl}/user/getCurrentUser`;
const getSellerDetailsApi = `${baseUrl}/user/getSellerDetails`;
const updateuserApi = `${baseUrl}/user/updateuser`;

// deals
const creatDealApi = `${baseUrl}/deal/create`;
const acceptRequestApi = `${baseUrl}/deal/acceptRequest`;
const deleteDealApi = `${baseUrl}/deal/delete`;
const cancelDealApi = `${baseUrl}/deal/cancelDeal`;
const getUserRequestsApi = `${baseUrl}/deal/user_requests`;
const getUserDealsApi = `${baseUrl}/deal/user_deals`;








export {
  sendCodeApi,
  signupApi,
  loginApi,
  logoutApi,
  getCurrentUserApi,
  getSellerDetailsApi,
  updateuserApi,
  creatDealApi,
  acceptRequestApi,
  deleteDealApi,
  getUserRequestsApi,
  getUserDealsApi,
  cancelDealApi
};
