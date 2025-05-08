/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser } from "../states/userSlice";
import { makeRequest } from "../hook/useApi";
import { isSending } from "../utils/useutils";
import { getUserDealsApi, getCurrentUserApi, logoutApi } from "../data/apis";
import { RootState } from "../states";
import { setDealError, setdealLoading, setDeals } from "../states/dealSlice";
import { db } from "../dexieDB";

export const UserContext = createContext<any>(undefined);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem('sol_escrow');
  const user = JSON.parse(localStorage.getItem('escrow_user') || "null");
  const pagination = useSelector((state: RootState) => state.deals.pagination);

  const getCurrentUser = async (token: any) => {
    const CachedUser = JSON.parse(localStorage.getItem('escrow_user') || "null");
    if(CachedUser) {dispatch(setCurrentUser(CachedUser))}
    const { res, error  } = await makeRequest("POST", getCurrentUserApi, null, null, token, null, "urlencoded");
    if (res) {
      localStorage.setItem('escrow_user', JSON.stringify(res?.data));
      dispatch(setCurrentUser(res?.data));
      return true;
    }
    return false;
  }

  const userLogout = async () => {
    isSending(true, "Logging out...");
    const cb = () => { isSending(false, "") }
    const { res } = await makeRequest("POST", logoutApi, null, cb, token, null, "urlencoded");
    if (res) {
      localStorage.removeItem('sol_escrow');
      localStorage.removeItem('escrow_user');
      await db.cached_data.clear(); // deletes all cached deals
      dispatch(setCurrentUser(null))
      window.location.href = "/login";
    }
  }

  const getUserDeals = async (pagination: any, currentUser:any) => {
    const CachedDeals = await db.cached_data.get(`${currentUser?._id}_deals`);
    if (CachedDeals && CachedDeals.length > 0) {dispatch(setDeals(CachedDeals || []))}
    const { res, error } = await makeRequest("POST", getUserDealsApi, { userId: currentUser?._id,  secureId: currentUser?.secureId,  page: pagination.page,  limit: pagination.limit}, null, token, null, "urlencoded");
    if(error) {
      dispatch(setDealError(error))
      dispatch(setdealLoading(false))
      return
    }
    if (res?.data?.deals) {
      const dls: any[] = res.data.deals || [];
      await db.cached_data.put(dls, `${currentUser?._id}_deals`); // cache the deals
      dispatch(setDeals(dls));
      dispatch(setDealError(null))
      dispatch(setdealLoading(false))
    }
  };

 // Only depend on token
  useEffect(() => {
    if(token) {
      Promise.all([
        getCurrentUser(token),
        getUserDeals(pagination, user)
      ])
    }
  }, [token])

  return (
    <UserContext.Provider
      value={{
        userLogout,
        getCurrentUser,
        token
      }}
    >
      {children}
    </UserContext.Provider>
  );
};