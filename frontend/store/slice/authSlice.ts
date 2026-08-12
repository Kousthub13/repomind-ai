import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    id: string;
    email: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            state.isAuthenticated = true;
        
            if (typeof window !== "undefined") {
                localStorage.setItem("token", action.payload);
            }
        },

        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },

        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
        
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
            }
        },
    },
});

export const {
    setToken,
    setUser,
    logout,
} = authSlice.actions;

export default authSlice.reducer;