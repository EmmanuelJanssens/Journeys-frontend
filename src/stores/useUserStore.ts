import axios from "axios";
import { defineStore } from "pinia";
import { ExperienceDto, JourneyDto, UserDto } from "types/dtos";
import { ApiAuthenticationResponse } from "types/journeys";

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

    const refreshInterval = ref();

    function startRefreshInterval() {
        refreshToken();
    }
    async function login(user: string, password: string): Promise<boolean> {
        const dto: UserDto = {
            username: user,
            password: password
        };
        let result = undefined;

        try {
            const response = await await axios.post("/api/authentication/login", dto);
            result = response.data;
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
        } catch (e) {
            return false;
        }
    }

    async function register(user: UserDto): Promise<boolean> {
        try {
            const response = await axios.post("/api/authentication/register", user);
            const result = response.data as ApiAuthenticationResponse;
            userRef.value.username = result.username;
            userRef.value.firstName = result.firstName;
            userRef.value.lastName = result.lastName;
            userRef.value.email = result.email;
            await login(user.username!, user.password!);
            return true;
        } catch (e) {
            return false;
        }
    }
    async function saveUser(user: UserDto, oldUsername: string): Promise<UserDto | undefined> {
        try {
            const token = JSON.parse(localStorage.getItem("user")!).token;
            const update = {
                user: user,
                oldUsername: oldUsername
            };
            const response = await axios.put("/api/user", update, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data as UserDto;
        } catch (e) {
            return undefined;
        }
    }

    async function fetchMyJourneys(): Promise<boolean> {
        try {
            const token = JSON.parse(localStorage.getItem("user")!).token;
            const response = await axios.get("/api/user/journeys", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            myJourneys.value = response.data.journeys as JourneyDto[];
            return true;
        } catch (e) {
            return false;
        }
    }

    async function fetchMyExperiences(): Promise<boolean> {
        try {
            const token = JSON.parse(localStorage.getItem("user")!).token;

            const response = await axios.get("/api/user/experiences", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            myExperiences.value = response.data as ExperienceDto[];
            return true;
        } catch (e) {
            return false;
        }
    }

    async function fetchMyProfile(): Promise<boolean> {
        try {
            const token = JSON.parse(localStorage.getItem("user")!).token;
            const response = await axios.get("/api/user/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            userRef.value = response.data as UserDto;
            return true;
        } catch (e) {
            return false;
        }
    }

    async function checkUserName(username: string): Promise<boolean> {
        try {
            const token = JSON.parse(localStorage.getItem("user")!).token;
            const user = {
                user: {
                    username: username
                }
            };
            const response = await axios.post("/api/user/username", user, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data) return true;
            else return false;
        } catch (e) {
            return false;
        }
    }

    async function updatePassword(data: {
        oldPassword: string;
        newPassword: string;
        public: boolean;
    }): Promise<boolean> {
        try {
            const token = JSON.parse(localStorage.getItem("user")!).token;
            const response = await axios.put("api/authentication/update", data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(response.data);
            if (!response.data) {
                return false;
            }

            return true;
        } catch (e) {
            return false;
        }
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

    async function refreshToken(): Promise<boolean> {
        try {
            if (!IsLoggedIn()) return false;
            const authToken = JSON.parse(localStorage.getItem("user")!).token;
            const result = await axios.get("/api/authentication/refresh", {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            localStorage.setItem(
                "user",
                JSON.stringify({
                    user: userRef.value,
                    token: result.data.token
                })
            );
            token.value = result.data.token;
            return true;
        } catch (e) {
            logout();
            return false;
        }
    }
    function removeJourney(id: string) {
        myJourneys.value = myJourneys.value?.filter((j) => j.id != id);
        myExperiences.value = myExperiences.value.filter((e) => e.journey != id);
    }
    return {
        userRef,
        token,
        loggedIn,
        myJourneys,
        myExperiences,
        refreshInterval,
        login,
        logout,
        register,
        IsLoggedIn,
        removeJourney,
        refreshToken,
        fetchMyJourneys,
        fetchMyExperiences,
        fetchMyProfile,
        saveUser,
        checkUserName,
        startRefreshInterval,
        updatePassword
    };
});
