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
    UserCredential
} from "firebase/auth";
import { authApp } from "google/firebase";
import { defineStore } from "pinia";
import { Experience, Journey, User as JUser } from "types/JourneyDtos";
import { uniqueNamesGenerator, adjectives, colors, animals, Config } from "unique-names-generator";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
    const myJourneys = ref<Journey[]>();
    const myExperiences = ref<Experience[]>([]);

    const state = ref({
        fetchingMyJourneys: false,
        isLoggedIn: false,
        currentUser: "guest"
    });
    const namesConfig: Config = {
        dictionaries: [adjectives, colors, animals],
        separator: "-",
        length: 3
    };

    authApp.onAuthStateChanged(async (fbuser) => {
        state.value.isLoggedIn = fbuser != undefined;
        if (fbuser) state.value.currentUser = fbuser.displayName!;
        else state.value.currentUser = "guest";
    });

    //start a timeout to check if the user loggedin, resolving or rejecting a promise
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
    //returns a promise wether the user loggedin
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

    //register with a specified provider
    //if the user is a new user we need to register im in the database
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
                    completed: credentials.user.emailVerified,
                    visibility: "public"
                };
                await axios.post("/api/authentication/register", newUser);
            }

            return credentials;
        }
        throw new Error("No provider specified");
    }

    //classic registration with an email and a password
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
            return credentials;
        } catch (e) {
            return undefined;
        }
    }

    //resets the user to undefined and clears the store
    async function logout() {
        myJourneys.value = [];
        myExperiences.value = [];
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

    //fetch a list of journeys belonging to the current user
    async function fetchMyJourneys(): Promise<Journey[] | undefined> {
        state.value.fetchingMyJourneys = true;
        const token = await authApp.currentUser?.getIdToken(true);
        const response = await axios.get("/api/user/journeys", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        myJourneys.value = response.data as Journey[];
        state.value.fetchingMyJourneys = false;
        return response.data;
    }

    //fetch user information
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

    //check if the username is availabele
    //TODO remove because a user is not identified by his username anymore
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

    //for immediate feedback when removing a journey from our list
    function removeJourney(id: string) {
        myJourneys.value = myJourneys.value?.filter((j) => j.id != id);
    }

    return {
        myJourneys,
        myExperiences,
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
        didLogin,
        state
    };
});
