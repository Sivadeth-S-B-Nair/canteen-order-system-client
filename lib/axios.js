import axios from "axios";
import { store } from "@/store/store";
import { setAccessToken,clearCredentials} from "@/store/slices/authSlice";

const api=axios.create({
    baseURL:process.env.NEXT_PUBLIC_API_URL,
    withCredentials:true
})

// REQUEST INTERCEPTOR
// Runs before every request — attaches the access token from Redux

//Without this block of code, every single time you wanted to fetch data in your React components, you would have to write this:
// A nightmare to maintain
// const token = useSelector(state => state.auth.accessToken);
// const response = await api.get('/orders', {
//     headers: { Authorization: `Bearer ${token}` }
// });

api.interceptors.request.use((config)=>{
    const token=store.getState().auth.accessToken
    if(token){
        config.headers.Authorization=`Bearer ${token}`
    }
    return config
})  

// RESPONSE INTERCEPTOR
// Runs after every response — handles 401s automatically
let isRefreshing=false
let failedQueue=[]

// When multiple requests fail simultaneously, queue them
// Process all at once when token is refreshed
const processQueue=(error,token=null)=>{
    failedQueue.forEach(({resolve,reject})=>{
        if(error) reject(error)
        else resolve(token)
    })
    failedQueue=[]
}

api.interceptors.response.use(
    // Successful response — pass straight through
    (response)=>response,
    // Failed response — check if it's a token expiry
    async(error)=>{
        //When an Axios request fails, Axios attaches a .config object to the error. This object is a perfect snapshot of the
        //  request that just died. It contains the URL (/api/users), the HTTP method (GET), the body payload, and the headers.
        const original=error.config
        const isExpired=error.response?.status===401 && error.response?.data?.message ==="Token expired"
        // Don't retry the refresh call itself — infinite loop prevention
        if(isExpired&&!original._retry){
            if(isRefreshing){
                // Another request already triggered a refresh
                // Queue this request and wait for the new token
                return new Promise((resolve,reject)=>{
                    failedQueue.push({resolve,reject})
                }).then(token=>{
                    original.headers.Authorization=`Bearer ${token}`
                    return api(original)
                })
            }
            original._retry=true
            isRefreshing=true
            
            try{
                const {data}=await api.post("/api/auth/refresh")
                const newToken=data.accessToken

                // Update Redux with new token
                store.dispatch(setAccessToken(newToken))

                // Retry all queued requests with new token
                processQueue(null,newToken)
                // Retry the original request
                original.headers.Authorization=`Bearer ${newToken}`
                return api(original)
            }
            catch(refreshError){
                // Refresh token also expired — force logout
                processQueue(refreshError,null)
                store.dispatch(clearCredentials())
                window.location.href="/login"
                return Promise.reject(refreshError)
            }
            finally{
                isRefreshing=false
            }
        }   
        return Promise.reject(error)
    }
)

export default api  