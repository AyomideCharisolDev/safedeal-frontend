import { createSlice, PayloadAction } from '@reduxjs/toolkit';


const initialState: any = {
  currentUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action:PayloadAction<any>) => {
      state.currentUser = action.payload;
    },
  },
});

export const {
    setCurrentUser
} = userSlice.actions;

export default userSlice.reducer;
