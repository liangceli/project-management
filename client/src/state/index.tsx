import { createSlice,PayloadAction } from "@reduxjs/toolkit";

export interface initialStateTypes {
    isSidebarCollapsed: boolean;
    isDarkMode: boolean;
}

const initialState: initialStateTypes = {
    isSidebarCollapsed: false,
    isDarkMode: false,
};

export const globalSlice = createSlice({
    name:"global",
    initialState,
    reducers: {
        setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
            state.isSidebarCollapsed = action.payload;
        },

        setIsDarkMode: (state, action: PayloadAction<boolean>) => {
            state.isDarkMode = action.payload;
        },
    },

});
// etIsSidebarCollapsed 和 setIsDarkMode 被导出，可以在组件中调用 dispatch(setIsSidebarCollapsed(true)) 来更新状态。
export const { setIsSidebarCollapsed, setIsDarkMode} = globalSlice.actions;
export default globalSlice.reducer;


// reducer是纯函数 负责接收当前状态state和一个action 然后返回新的状态newState