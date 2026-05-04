import { io } from "socket.io-client";

let socket = null; // singleton — one socket for the whole app

// Called once when user logs in or page loads with valid session
export const connectSocket = (accessToken) => {
  // Don't create duplicate connections
  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
    // Send access token during handshake
    // Server's io.use() middleware reads this for authentication
    auth:{token:accessToken},
    // Don't connect automatically — we control when it connects
    autoConnect:true,
    //Reconnection settings
    reconnection:true,
    reconnectionDelay:1000, //wait 1s before first retry
    reconnectionAttempts:5 //try 5 times before giving up
  });

  socket.on("connect",()=>{
    console.log("Socket connected:", socket.id)
  })
  socket.on("disconnect",(reason)=>{
    console.log("Socket disconnected:",reason)
  })
  socket.on("connect_error",(err)=>{
    console.log("Socket connection error:",err.message)
  })
  return socket
};

// Called on logout or when component unmounts
export const disconnectSocket=()=>{
    if(socket){
        socket.disconnect()
        socket=null
    }
}

// Returns the current socket instance
// Used by hooks to attach event listeners
export const getSocket=()=>socket