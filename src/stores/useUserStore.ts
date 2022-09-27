import { defineStore } from "pinia";
import { ref } from "vue";
import axios, { AxiosError } from 'axios'


export const useUserStore = defineStore('user', () => {
  const userObj:User = {
      userName:'',
      firstName:'',
      lastName:'',
      email:''
    }
  const userRef = ref(userObj)
  const token = ref('')
  const loggedIn = ref(false)

  function login(user: string, password: string): Promise<Boolean>{
    console.log("Log "+ user+ " in")
    return axios.post('/api/auth/login',
    {
      userName: user,
      password: password
    })
    .then(
      response => {
        const result = response.data as ApiAuthenticationResponse
        userRef.value.userName = result.userName
        userRef.value.firstName = result.firstName
        userRef.value.lastName = result.lastName
        userRef.value.email = result.email
        token.value = result.token
        loggedIn.value = true
        return  true;
      }
    )
    .catch((error: AxiosError) => {
      console.log((error.response?.data as ApiError).message)
      return false
    })

  }
  function logout()
  {

  }
  function register()
  {

  }
  function IsLoggedIn(): boolean{
    return loggedIn.value
  }

  return {userRef,token,loggedIn, login, logout, register, IsLoggedIn}
})
