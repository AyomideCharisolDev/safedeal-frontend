import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: any = {
  deals:[],
  pagination: {page:1, limit:50, totalPages:1, filters:{}},
  dealError:null,
  dealLoading:true
};

const dealSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setDeals: (state, action:PayloadAction<any>) => {
      state.deals = action.payload;
    },
    setPagination: (state, action:PayloadAction<any>) => {
      state.pagination = action.payload;
    },
    setDealError: (state, action:PayloadAction<any>) => {
      state.dealError = action.payload;
    },
    setdealLoading: (state, action:PayloadAction<any>) => {
      state.dealLoading = action.payload;
    },
  },
});

export const {
  setDeals,
    setPagination,
    setDealError,
    setdealLoading
} = dealSlice.actions;

export default dealSlice.reducer;
