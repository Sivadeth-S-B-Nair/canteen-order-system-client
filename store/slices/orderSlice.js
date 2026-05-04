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
            if(updated.status==="Picked Up"){
                state.allOrders=state.allOrders.filter(o=>o.id!==updated.id)
            }else{
                const idx=state.allOrders.findIndex(o=>o.id===updated.id)
                if(idx!==-1) state.allOrders[idx]=updated
            }
            const myIdx=state.myOrders.findIndex(o=>o.id===updated.id)
            if(myIdx!==-1) state.myOrders[myIdx]=updated
        },
        addNewOrder:(state,action)=>{
            state.allOrders.push(action.payload)
        }
    }
})


export const {setMyOrders,setAllOrders,setOrdersLoading,updateOrderInList,addNewOrder}= orderSlice.actions
export default orderSlice.reducer