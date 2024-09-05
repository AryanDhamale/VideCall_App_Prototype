import { createContext, useContext, useMemo } from "react";
import io from "socket.io-client";
import server from "../../enviroment.js";

const socketContext = createContext(null);

export const useSocket = ()=>{
    const socket=useContext(socketContext);
    return socket;
}

export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io(server), []);
    return (
        <socketContext.Provider value={socket}>
            {children}
        </socketContext.Provider>
    );
}