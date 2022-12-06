import axios from "axios";
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
import { Journey, PagedJourneys, PointOfInterest, User as JUser } from "types/JourneyDtos";
import { uniqueNamesGenerator, adjectives, colors, animals, Config } from "unique-names-generator";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
    const myJourneys = ref<PagedJourneys>({
        journeys: []
    });
    const myPois = ref<PointOfInterest[]>([]);

    const myStats = ref({
        experiences: 0,
        pois: 0,
        journeys: 0
    });
    const state = ref({
        fetchingMyJourneys: false,
        fetchingMyPois: false,
        isLoggedIn: false,
        nextPage: "",
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

    async function login(email: string, password: string) {
        const creds = await signInWithEmailAndPassword(authApp, email, password);
        await updateCurrentUser(authApp, creds.user);
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
        const credentials = await createUserWithEmailAndPassword(authApp, user.email!, user.password!);
        if (!user.username || user.username.length == 0) user.username = uniqueNamesGenerator(namesConfig);
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
    }

    //resets the user to undefined and clears the store
    async function logout() {
        myJourneys.value = {
            journeys: [],
            pageInfo: undefined
        };
        myPois.value = [];
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
    async function fetchMyJourneys(cursor?: string): Promise<PagedJourneys[] | undefined> {
        state.value.fetchingMyJourneys = true;
        const token = await authApp.currentUser?.getIdToken(true);
        const url = `/api/user/journeys?pages=5&cursor=${cursor}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        myJourneys.value.journeys = myJourneys.value.journeys.concat(...response.data.journeys);
        myJourneys.value.pageInfo = response.data.pageInfo;
        myJourneys.value.total = response.data.total;
        myJourneys.value.totalExperiences = response.data.totalExperiences;
        state.value.fetchingMyJourneys = false;
        return response.data;
    }

    async function fetchMyPois() {
        state.value.fetchingMyPois = true;
        const token = await authApp.currentUser?.getIdToken(false);
        const response = await axios.get("/api/user/pois", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        myPois.value = response.data;
        state.value.fetchingMyPois = false;
        return response.data;
    }

    async function fetchMyStats() {
        const token = await authApp.currentUser?.getIdToken(false);
        const response = await axios.get("/api/user/stats", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        myStats.value = response.data;
        return response.data;
    }

    //for immediate feedback when removing a journey from our list
    function removeJourney(id: string) {
        myJourneys.value!.journeys = myJourneys.value?.journeys.filter((j) => j.id != id)!;
    }

    return {
        myJourneys,
        myPois,
        myStats,
        fetchMyJourneys,
        fetchMyPois,
        fetchMyStats,
        login,
        logout,
        registerWith,
        register,
        removeJourney,
        saveUser,
        didLogin,
        state
    };
});
