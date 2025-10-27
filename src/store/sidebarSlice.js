import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'dashboard',
  isCollapsed: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setCollapsed: (state, action) => {
      state.isCollapsed = action.payload;
    },
  },
});

export const { setActiveTab, setCollapsed } = sidebarSlice.actions;
export default sidebarSlice.reducer;
