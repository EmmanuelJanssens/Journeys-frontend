import type { AxiosError } from "axios";
import axios from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
    const userObj: User = {
        userName: "",
        firstName: "",
        lastName: "",
        email: ""
    };
    const userRef = ref(userObj);
    const token = ref("");
    const loggedIn = ref(false);

    async function login(user: string, password: string): Promise<boolean> {
        console.log("Log " + user + " in");
        return await axios
            .post("/api/auth/login", {
                userName: user,
                password
            })
            .then((response) => {
                const result = response.data as ApiAuthenticationResponse;
                userRef.value.userName = result.userName;
                userRef.value.firstName = result.firstName;
                userRef.value.lastName = result.lastName;
                userRef.value.email = result.email;
                token.value = result.token;
                loggedIn.value = true;
                return true;
            })
            .catch((error: AxiosError) => {
                console.log((error.response?.data as ApiError).message);
                return false;
            });
    }
    function logout(): void {
        localStorage.removeItem("user");
    }
    async function register(user: UserRegister): Promise<boolean> {
        console.log("Register " + user.userName);
        return await axios
            .post("/api/auth/register", user)
            .then((response) => {
                const result = response.data as ApiAuthenticationResponse;
                userRef.value.userName = result.userName;
                userRef.value.firstName = result.firstName;
                userRef.value.lastName = result.lastName;
                userRef.value.email = result.email;
                token.value = result.token;
                loggedIn.value = true;
                return true;
            })
            .catch((error: AxiosError) => {
                console.log((error.response?.data as ApiError).message);
                return false;
            });
    }
    function IsLoggedIn(): boolean {
        return loggedIn.value;
    }

    return { userRef, token, loggedIn, login, logout, register, IsLoggedIn };
});
