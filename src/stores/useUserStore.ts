import type { AxiosError } from "axios";
import axios from "axios";
import { defineStore } from "pinia";
import { JourneyDto, UserDto } from "types/dtos";
import { User, ApiAuthenticationResponse, ApiError } from "types/journeys";

import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
    const userObj: UserDto = {
        username: "",
        firstName: "",
        lastName: "",
        email: ""
    };
    const userRef = ref(userObj);
    const token = ref("");
    const loggedIn = ref(false);

    const myJourneys = ref<JourneyDto[]>();

    async function login(user: string, password: string): Promise<boolean> {
        const dto: UserDto = {
            username: user,
            password: password
        };
        return await axios
            .post("/api/authentication/login", dto)
            .then((response) => {
                const result = response.data as ApiAuthenticationResponse;
                userRef.value.username = result.username;
                userRef.value.firstName = result.firstName;
                userRef.value.lastName = result.lastName;
                userRef.value.email = result.email;
                token.value = result.token;
                loggedIn.value = true;
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        user: userRef.value,
                        token: token.value
                    })
                );
                return true;
            })
            .catch((error: AxiosError) => {
                return false;
            });
    }

    async function register(user: UserDto): Promise<boolean> {
        return await axios
            .post("/api/authentication/register", user)
            .then((response) => {
                const result = response.data as ApiAuthenticationResponse;
                userRef.value.username = result.username;
                userRef.value.firstName = result.firstName;
                userRef.value.lastName = result.lastName;
                userRef.value.email = result.email;
                token.value = result.token;
                loggedIn.value = true;
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        user: userRef.value,
                        token: token.value
                    })
                );
                return true;
            })
            .catch((error: AxiosError) => {
                return false;
            });
    }

    function fetchMyJourneys(): Promise<boolean> {
        return axios
            .get("/api/user/" + userRef.value.username + "/journeys")
            .then((response) => {
                myJourneys.value = response.data.journeys as JourneyDto[];
                return true;
            })
            .catch(() => {
                return false;
            });
    }

    function IsLoggedIn(): boolean {
        return loggedIn.value;
    }

    function logout(): void {
        userRef.value = {
            username: "",
            firstName: "",
            lastName: "",
            email: ""
        };
        myJourneys.value = [];
        token.value = "";
        loggedIn.value = false;
        localStorage.removeItem("user");
    }

    return {
        userRef,
        token,
        loggedIn,
        login,
        logout,
        register,
        IsLoggedIn,
        myJourneys,
        fetchMyJourneys
    };
});
