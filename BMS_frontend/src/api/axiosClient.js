import axios from "axios";
import { API_BASE_URL } from "../config.js";

const axiosClient = axios.create({

    baseURL: API_BASE_URL,

    timeout: 30000,

    headers: {

        "Content-Type": "application/json"

    }

});

axiosClient.interceptors.request.use((config) => {

    const token =
        sessionStorage.getItem("irbms_token");

    if (token) {

        config.headers.Authorization =
            `Bearer ${token}`;

    }

    return config;

});

axiosClient.interceptors.response.use(

    (response) => {

        return response.data;

    },

    (error) => {

        let message =

            "Could not reach backend";

        if (error.response) {

            if (typeof error.response.data === "string") {

                message =
                    error.response.data;

            }

            else {

                message =
                    error.response.data?.message ||
                    error.response.statusText;

            }

        }

        else if (error.message) {

            message = error.message;

        }

        return Promise.reject(
            new Error(message)
        );

    }

);

export default axiosClient;