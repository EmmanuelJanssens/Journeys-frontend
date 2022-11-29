import axios from "axios";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, User, UserCredential } from "firebase/auth";
import { authApp } from "google/firebase";
import { defineStore } from "pinia";
import { ExperienceDto, JourneyDto, UserDto } from "types/dtos";
import { uniqueNamesGenerator, adjectives, colors, animals, Config } from "unique-names-generator";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
    const isLoggedIn = ref(false);
    const myJourneys = ref<JourneyDto[]>();
    const myExperiences = ref<ExperienceDto[]>([]);

    const namesConfig: Config = {
        dictionaries: [adjectives, colors, animals],
        separator: "-",
        length: 3
    };

    authApp.onAuthStateChanged(async (fbuser) => {
        isLoggedIn.value = fbuser != undefined;
        if (fbuser) {
            const token = await authApp.currentUser?.getIdToken(true);

            const response = await axios.get("api/user/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
    });

    function waitForUser(time: number, resolve?: (data: any) => void, reject?: (data: any) => void) {
        if (!authApp.currentUser) {
            if (time > 4) {
                if (reject) reject(false);
                return;
            } else {
                setTimeout(() => {
                    waitForUser(time + 1, resolve, reject);
                }, 500);
            }
        } else {
            if (resolve) resolve(true);
        }
    }

    async function didLogin() {
        const promise = new Promise<any>((resolve, reject) => {
            waitForUser(0, resolve, reject);
        });
        return promise;
    }
    async function login(email: string, password: string): Promise<boolean> {
        try {
            console.log(email);
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
                const name = uniqueNamesGenerator(namesConfig);
                const newUser: UserDto = {
                    username: name,
                    email: credentials.user.email!,
                    uid: credentials.user.uid
                };
                const response = await axios.post("/api/authentication/provider", newUser);
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
        myJourneys.value = [];

        await authApp.signOut();
    }
    async function saveUser(user: UserDto): Promise<UserDto | undefined> {
        try {
            const token = await authApp.currentUser?.getIdToken(true);
            const response = await axios.put("/api/user", user, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data as UserDto;
        } catch (e) {
            return undefined;
        }
    }

    async function fetchMyJourneys(): Promise<JourneyDto | undefined> {
        try {
            const token = await authApp.currentUser?.getIdToken(true);
            const response = await axios.get("/api/user/journeys", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            myJourneys.value = response.data as JourneyDto[];
            return response.data;
        } catch (e) {
            return undefined;
        }
    }

    async function fetchMyProfile(): Promise<boolean> {
        try {
            const token = await authApp.currentUser?.getIdToken(false);
            const response = await axios.get("/api/user/profile", {
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
            const user = {
                username: username
            };
            const response = await axios.post("/api/user/username", user);
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
        updatePassword,
        didLogin
    };
});
