import { createSlice } from "@reduxjs/toolkit";

const orderSlice=createSlice({
    name:"orders",   
    initialState:{
        myOrders:[],
        allOrders:[],
        loading:false,
        error:null
    },
    reducers:{
        setMyOrders:(state,action)=>{
            state.myOrders=action.payload
            state.loading=false
        },
        setAllOrders:(state,action)=>{
            state.allOrders=action.payload
            state.loading=false
        },
        setOrdersLoading:(state,action)=>{
            state.loading=true
            state.error=null
        },
        updateOrderInList:(state,action)=>{
            const updated= action.payload
            const myIdx=state.myOrders.findIndex(o=>o.id===updated.id)
            if(myIdx!==-1) state.myOrders[myIdx]=updated
            const allIdx=state.allOrders.findIndex(o=>o.id===updated.id)
            if(allIdx!==-1) state.allOrders[allIdx]=updated
        }   
    }
})


export const {setMyOrders,setAllOrders,setOrdersLoading,updateOrderInList}= orderSlice.actions
export default orderSlice.reducer