import type { AxiosError } from "axios";
import axios from "axios";
import { defineStore } from "pinia";
import { ExperienceDto, JourneyDto, UserDto } from "types/dtos";
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
    const myExperiences = ref<ExperienceDto[]>([]);
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
                return login(user.username!, user.password!)
                    .then(() => {
                        return true;
                    })
                    .catch(() => {
                        return false;
                    });
            })
            .catch((error: AxiosError) => {
                return false;
            });
    }

    function fetchMyJourneys(): Promise<boolean> {
        const token = JSON.parse(localStorage.getItem("user")!).token;

        return axios
            .get("/api/user/journeys", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                myJourneys.value = response.data.journeys as JourneyDto[];
                return true;
            })
            .catch(() => {
                return false;
            });
    }

    function fetchMyExperiences(): Promise<boolean> {
        const token = JSON.parse(localStorage.getItem("user")!).token;

        return axios
            .get("/api/user/experiences", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                myExperiences.value = response.data as ExperienceDto[];
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

    function removeJourney(id: string) {
        myJourneys.value = myJourneys.value?.filter((j) => j.id != id);
        myExperiences.value = myExperiences.value.filter(
            (e) => e.journey != id
        );
    }
    return {
        userRef,
        token,
        loggedIn,
        login,
        logout,
        register,
        IsLoggedIn,
        removeJourney,
        myJourneys,
        myExperiences,
        fetchMyJourneys,
        fetchMyExperiences
    };
});
