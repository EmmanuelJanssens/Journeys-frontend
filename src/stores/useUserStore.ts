import axios from "axios";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import {
    createUserWithEmailAndPassword,
    getAdditionalUserInfo,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateCurrentUser,
    updateProfile,
    User,
    UserCredential
} from "firebase/auth";
import { authApp } from "google/firebase";
import { defineStore } from "pinia";
import { isErrored } from "stream";
import { Experience, Journey, User as JUser } from "types/JourneyDtos";
import { uniqueNamesGenerator, adjectives, colors, animals, Config } from "unique-names-generator";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
    const isLoggedIn = ref(false);
    const myJourneys = ref<Journey[]>();
    const myExperiences = ref<Experience[]>([]);

    const namesConfig: Config = {
        dictionaries: [adjectives, colors, animals],
        separator: "-",
        length: 3
    };

    authApp.onAuthStateChanged(async (fbuser) => {
        isLoggedIn.value = fbuser != undefined;
        if (fbuser) {
            try {
                const token = await authApp.currentUser?.getIdToken(true);
            } catch (e) {
                //
            }
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
            const creds = await signInWithEmailAndPassword(authApp, email, password);
            return creds.user != undefined;
        } catch (e) {
            return false;
        }
    }

    async function registerWith(provider?: string): Promise<UserCredential> {
        if (provider == "google") {
            const googleAuthProvider = new GoogleAuthProvider();
            const credentials = await signInWithPopup(authApp, googleAuthProvider);
            if (getAdditionalUserInfo(credentials)?.isNewUser) {
                const name =
                    credentials.user.displayName?.length! > 0
                        ? credentials.user.displayName
                        : uniqueNamesGenerator(namesConfig);
                const newUser = {
                    username: name,
                    uid: credentials.user.uid,
                    completed: credentials.user.emailVerified
                };
                await axios.post("/api/authentication/register", newUser);
            }

            return credentials;
        }
        throw new Error("No provider specified");
    }
    async function register(user: JUser): Promise<UserCredential | undefined> {
        try {
            const credentials = await createUserWithEmailAndPassword(authApp, user.email!, user.password!);

            const dto = {
                uid: credentials.user.uid,
                username: user.username,
                firstname: user.firstName,
                lastname: user.lastName,
                visibility: "public",
                completed: false
            };
            await axios.post("/api/authentication/register", dto);
            await updateProfile(credentials.user, {
                displayName: user.username
            });

            await updateCurrentUser(authApp, credentials.user);
            //const signin = await signInWithEmailAndPassword(authApp, user.email!, user.password!);
            return credentials;
        } catch (e) {
            return undefined;
        }
    }
    async function logout() {
        myJourneys.value = [];

        await authApp.signOut();
    }
    async function saveUser(user: JUser): Promise<any | undefined> {
        try {
            const token = await authApp.currentUser?.getIdToken(true);
            const response = await axios.put("/api/user", user, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (e) {
            return undefined;
        }
    }

    async function fetchMyJourneys(): Promise<Journey[] | undefined> {
        const token = await authApp.currentUser?.getIdToken(true);
        const response = await axios.get("/api/user/journeys", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        myJourneys.value = response.data as Journey[];
        return response.data;
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
