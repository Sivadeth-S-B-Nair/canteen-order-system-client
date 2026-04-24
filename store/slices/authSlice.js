import { createSlice } from "@reduxjs/toolkit";

const authSlice=createSlice({
    name:"auth",
    initialState:{
        user:null,
        accessToken:null
    },
    reducers:{
        // Called after login — stores user and token
        setCredentials:(state,action)=>{
            state.user=action.payload.user
            state.accessToken=action.payload.accessToken
        },
        // Called after token refresh — only updates the token
        setAccessToken:(state,action)=>{
            state.accessToken=action.payload
        },
        // Called on logout — wipes everything
        clearCredentials:(state)=>{
            state.user=null
            state.accessToken=null
        }
    }
})

export const {setCredentials,setAccessToken,clearCredentials}=authSlice.actions
export default authSlice.reducer    