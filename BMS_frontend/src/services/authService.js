import axiosClient from "../api/axiosClient.js";

const authService = {

    async login(username, password) {

        const response = await axiosClient.post(
            "/auth/login",
            {
                username,
                password
            }
        );

        return {
            success: response.success,
            message: response.message,
            role: response.role
        };

    },

    logout() {

        sessionStorage.removeItem("irbms_token");
        sessionStorage.removeItem("role");

    },

    isLoggedIn() {

        return !!sessionStorage.getItem("irbms_token");

    },

    getRole() {

        return sessionStorage.getItem("role");

    }

};

export default authService;