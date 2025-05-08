/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, ReactNode, useEffect, useState } from "react";
import { makeRequest } from "../../hook/useApi";
import { allVideosApi } from "../../data/apis";
import { toast } from "react-toastify"; // 👈 if you're using react-toastify

export const PostContext = createContext<any>(undefined);

export const PostContextProvider = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("adesina_token");

  const [posts, setPosts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [Params, setParams] = useState({
    page: 1,
    limit: 50,
    totalPages: 0,
    filter: {},
  });

  const [postParams, setPostParams] = useState({
    page: 1,
    limit: 50,
    totalPages: 0,
    filter: {},
  });

  const getCachedVideos = () => {
    const cached = JSON.parse(localStorage.getItem("ad_videos") || "[]");
    if (cached?.vlogs?.length > 0) {
      setPosts(cached.vlogs);
      setPostParams({
        ...Params,
        totalPages: cached.totalPages || 0,
        limit: cached.limit || 50,
      });
    }
  };

  const areVideosDifferent = (newVideos: any[], oldVideos: any[]): boolean => {
    if (newVideos.length !== oldVideos.length) return true;

    const newIds = new Set(newVideos.map((v: any) => v._id));
    const oldIds = new Set(oldVideos.map((v: any) => v._id));

    for (const id of newIds) {
      if (!oldIds.has(id)) return true;
    }

    return false;
  };

  const getAllVideos = async (params: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await makeRequest("POST", allVideosApi, params, null, null);
      if (res?.data?.vlogs) {
        const cached = JSON.parse(localStorage.getItem("ad_videos") || "[]");
        const oldVideos = cached?.vlogs || [];

        if (areVideosDifferent(res.data.vlogs, oldVideos)) {
          localStorage.setItem("ad_videos", JSON.stringify(res.data));
          setPosts(res.data.vlogs || []);
          toast.info("New videos loaded ✅"); // 👈 show toast notification
        }

        setPostParams({
          ...Params,
          totalPages: res.data.totalPages || 0,
          limit: res.data.limit || 50,
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch videos:", err.message);
      setError("Could not fetch latest videos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCachedVideos(); // Step 1: Show cached videos immediately
    getAllVideos(Params); // Step 2: Fetch latest videos
  }, []);

  return (
    <PostContext.Provider
      value={{
        Params,
        setParams,
        token,
        posts,
        setPosts,
        getAllVideos,
        postParams,
        setPostParams,
        isLoading,
        error,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
