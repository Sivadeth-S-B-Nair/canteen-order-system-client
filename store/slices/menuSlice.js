import { createSlice } from "@reduxjs/toolkit";

const menuSlice=createSlice({
    name:"menu",
    initialState:{
        items:[],
        loading:false,
        error:null,
    },
    reducers:{
        setMenuItems:(state,action)=>{
            state.items=action.payload,
            state.loading=false,
            state.error=null
        },
        setMenuLoading:(state,action)=>{
            state.loading=true,
            state.error=null
        },
        setMenuError:(state,action)=>{
            state.loading=false,
            state.error=action.payload
        }
    }
})

export const {setMenuItems,setMenuLoading,setMenuError} = menuSlice.actions
export default menuSlice.reducer