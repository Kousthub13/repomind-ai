"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { setToken } from "@/store/slice/authSlice";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            store.dispatch(setToken(token));
        }

        setInitialized(true);
    }, []);

    if (!initialized) {
        return null;
    }

    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
}