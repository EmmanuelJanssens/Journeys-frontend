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
import { Journey, PagedJourneys, PointOfInterest, User } from "types/JourneyDtos";
import { uniqueNamesGenerator, adjectives, colors, animals, Config } from "unique-names-generator";
import { ref } from "vue";

export class UserDidNotLogIn extends Error {}
export const useUserStore = defineStore("user", () => {
    //will always be loaded on first logbook render
    const myJourneys = ref<Journey[]>([]);
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
        userData: {
            username: "guest",
            firstname: "guest",
            lastname: "guest",
            visibility: "public"
        }
    });

    const namesConfig: Config = {
        dictionaries: [adjectives, colors, animals],
        separator: "-",
        length: 3
    };

    authApp.onAuthStateChanged(async (fbuser) => {
        state.value.isLoggedIn = fbuser != undefined;
        if (fbuser) state.value.userData.username = fbuser.displayName!;
        else state.value.userData.username = "guest";
    });

    //start a timeout to check if the user loggedin, resolving or rejecting a promise
    function waitForUser(time: number, resolve?: (data: any) => void, reject?: (data: any) => void) {
        if (!authApp.currentUser) {
            if (time > 4) {
                if (reject) {
                    reject(new UserDidNotLogIn("User is not logged in"));
                }
                return;
            } else {
                setTimeout(() => {
                    waitForUser(time + 1, resolve, reject);
                }, 500);
            }
        } else {
            if (resolve) {
                resolve(true);
            }
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
                    visibility: "public"
                };
                const token = await authApp.currentUser?.getIdToken(true);
                await axios.post("/api/user", newUser, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }

            return credentials;
        }
        throw new Error("No provider specified");
    }

    //classic registration with an email and a password
    async function register(user: User): Promise<UserCredential | undefined> {
        const credentials = await createUserWithEmailAndPassword(authApp, user.email!, user.password!);
        if (!user.username || user.username.length == 0) user.username = uniqueNamesGenerator(namesConfig);
        const dto = {
            uid: credentials.user.uid,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            visibility: "public"
        };
        const token = await authApp.currentUser?.getIdToken(true);

        await axios.post("/api/user", dto, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        await updateProfile(credentials.user, {
            displayName: user.username
        });

        await updateCurrentUser(authApp, credentials.user);
        return credentials;
    }

    //resets the user to undefined and clears the store
    async function logout() {
        myJourneys.value = [];
        myPois.value = [];
        await authApp.signOut();
    }

    async function saveUser(user: {
        username?: string;
        firstName?: string;
        lastName?: string;
    }): Promise<any | undefined> {
        const token = await authApp.currentUser?.getIdToken(true);
        if (user.username?.length == 0) delete user.username;
        if (user.firstName?.length == 0) delete user.firstName;
        if (user.lastName?.length == 0) delete user.lastName;
        const response = await axios.patch("/api/user", user, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }

    // async function fetchNextPage(page: number, cursor?: string) {
    //     state.value.fetchingMyJourneys = true;
    //     const token = await authApp.currentUser?.getIdToken(true);
    //     const url = `/api/user/journeys?pages=${page}&cursor=${cursor}`;
    //     const response = await axios.get(url, {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     });
    //     return response.data;
    // }
    //fetch a list of journeys belonging to the current user
    async function fetchMyJourneys() {
        state.value.fetchingMyJourneys = true;
        const token = await authApp.currentUser?.getIdToken(true);
        const url = `/api/user/journeys`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        myJourneys.value = response.data;
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
        const response = await axios.get("/api/user/profile", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        myStats.value = {
            journeys: response.data.journeysAggregate.count,
            pois: response.data.poisAggregate.count,
            experiences: response.data.experiencesAggregate.count
        };
        state.value.userData.username = response.data.username;
        state.value.userData.firstname = response.data.firstname;
        state.value.userData.lastname = response.data.lastname;
        state.value.userData.visibility = response.data.visibility;
        const journeys = await axios.get("/api/user/journeys?page=1&limit=10", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return journeys;
    }

    async function fetchNextJourneyPage(page: number) {
        const token = await authApp.currentUser?.getIdToken(false);
        const response = await axios.get(`/api/user/journeys?page=${page}&limit=10`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }
    //for immediate feedback when removing a journey from our list
    function removeJourney(id: string) {
        myJourneys.value = myJourneys.value?.filter((j) => j.id != id)!;
    }

    return {
        myJourneys,
        myPois,
        myStats,
        fetchMyJourneys,
        fetchNextJourneyPage,
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
