import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {

        const cached =
            sessionStorage.getItem("irbms_user");

        return cached
            ? JSON.parse(cached)
            : null;

    });

    const login = (username, role = "ADMIN") => {

        const profile = {

            username,

            role,

            zone: "East Coast Railway",

            loginAt: new Date().toISOString()

        };

        sessionStorage.setItem(

            "irbms_user",

            JSON.stringify(profile)

        );

        setUser(profile);

    };

    const logout = () => {

        sessionStorage.removeItem("irbms_user");
        sessionStorage.removeItem("irbms_token");
        sessionStorage.removeItem("role");

        setUser(null);

    };

    return (

        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}

export const useAuth = () => useContext(AuthContext);