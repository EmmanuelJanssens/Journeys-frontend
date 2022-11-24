import axios from "axios";
import {
    AuthProvider,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    User,
    UserCredential,
    UserInfo
} from "firebase/auth";
import { authApp } from "google/firebase";
import { defineStore } from "pinia";
import { ExperienceDto, JourneyDto, UserDto } from "types/dtos";

import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
    const fbUser = ref();
    const isLoggedIn = ref(false);
    const myJourneys = ref<JourneyDto[]>();
    const myExperiences = ref<ExperienceDto[]>([]);

    authApp.onAuthStateChanged((user) => {
        fbUser.value = user;
        isLoggedIn.value = fbUser.value != undefined;
    });

    async function login(email: string, password: string): Promise<boolean> {
        try {
            const creds = await signInWithEmailAndPassword(authApp, email, password);
            return creds.user != undefined;
        } catch (e) {
            return false;
        }
    }

    async function registerWith(provider?: string): Promise<UserCredential | undefined> {
        try {
            if (provider == "google") {
                const googleAuthProvider = new GoogleAuthProvider();
                const credentials = await signInWithPopup(authApp, googleAuthProvider);
                const newUser: UserDto = {
                    username: credentials.user.displayName ? credentials.user.displayName : credentials.user.email!,
                    email: credentials.user.email!
                };
                const response = await axios.post("/api/authentication/provider", credentials.user);
                return credentials;
            }
        } catch (e) {
            return undefined;
        }
    }
    async function register(user: UserDto): Promise<UserCredential | undefined> {
        try {
            await axios.post("/api/authentication/register", user);
            const signin = await signInWithEmailAndPassword(authApp, user.email!, user.password!);
            return signin;
        } catch (e) {
            return undefined;
        }
    }
    async function logout() {
        authApp.signOut();
    }
    async function saveUser(user: UserDto, oldUsername: string): Promise<UserDto | undefined> {
        try {
            const token = await authApp.currentUser?.getIdToken(false);
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
            const token = await authApp.currentUser?.getIdToken(false);
            const response = await axios.get("/api/user/journeys", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            myJourneys.value = response.data as JourneyDto[];
            return true;
        } catch (e) {
            return false;
        }
    }

    async function fetchMyProfile(): Promise<boolean> {
        try {
            const token = await authApp.currentUser?.getIdToken(false);
            const response = await axios.get("/api/user/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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

    async function updatePassword(): Promise<boolean> {
        return new Promise(() => false);
    }

    function removeJourney(id: string) {
        myJourneys.value = myJourneys.value?.filter((j) => j.id != id);
        myExperiences.value = myExperiences.value.filter((e) => e.journey != id);
    }
    return {
        myJourneys,
        myExperiences,
        isLoggedIn,
        login,
        logout,
        registerWith,
        register,
        removeJourney,
        fetchMyJourneys,
        fetchMyProfile,
        saveUser,
        checkUserName,
        updatePassword
    };
});
