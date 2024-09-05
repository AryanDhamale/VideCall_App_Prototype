import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {useSocket} from '../context/SocketProvider.jsx'
import {useNavigate} from 'react-router-dom';
import './Lobby.css'

export default function Lobby() {
    let [email,setEmail]=useState("");
    let [newEmail,setNewEmail]=useState("");
    let [newRoom,setNewRoom]=useState("");
    const Room=useRef();
    const socket=useSocket();
    const navigation=useNavigate();
    const handleSubmit=useCallback((event)=>{
        event.preventDefault();
        if(email && Room.current.value)
        {
            socket.emit("user:join",{email,Room: Room.current.value});
        }
        else 
        {
            alert("Email and Room-ID are required");
        }
    },[email]);

    const generateRoomId=()=>{
        const id=uuidv4();
        if(Room)
        {
          Room.current.value=id;
        }
    }

    useEffect(()=>{
        if(Room)
        {
            generateRoomId();
        }
    },[]);

    const handleNewSubmit=useCallback((event)=>{
        event.preventDefault();
        if(newEmail && newRoom)
        {
            socket.emit("user:join",{email : newEmail,Room:newRoom});
        }
        else 
        {
            alert("Email and Room-ID are required");
        }
    },[newEmail,newRoom]);

    //socekt code // 
    const hadleJoin=({email,Room})=>{
        console.log(`from server email : ${email} Room : ${Room}`);
        navigation(`/room/${email}/${Room}`);
    }
    useEffect(()=>{
        socket.on("user:join",hadleJoin);
        return ()=>{
            socket.off("user:join",hadleJoin);
        }
    },[socket]);
    return (
        <div className="lobby-con flex">
            <div id="carouselExampleCaptions" className="carousel slide box">
                <div className="carousel-indicators">
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
                </div>
                <div className="carousel-inner" style={{borderRadius:"5px"}}>
                    <div className="carousel-item active cold">
                        <div className='tranparent'></div>
                        <div className='info'>
                            <p className='caption'>Make-a-video-call</p>
                            <form onSubmit={handleSubmit}>
                             <div> <input type="text" placeholder='Enter your Email-ID or Name' value={email} onChange={(event)=>{setEmail(event.target.value)}}/></div>
                             <div className='reload-con'><input  ref={Room} disabled type="text"  placeholder='Room-ID'/> <i onClick={generateRoomId} className="fa-solid fa-rotate-right reload"></i></div>
                             <button type='submit'>Create</button>
                            </form>
                        </div>
                    </div>
                    <div className="carousel-item cold">
                    <div className='tranparent'></div>
                        <div className='info'>
                            <p className='caption'>Join-to-video-call</p>
                            <form onSubmit={handleNewSubmit}>
                             <div> <input type="text" placeholder='enter your email' value={newEmail} onChange={(event)=>{setNewEmail(event.target.value)}} /></div>
                             <div><input type="text" placeholder='Room-id' value={newRoom} onChange={(event)=>{setNewRoom(event.target.value)}}/></div>
                             <button type='submit'>Join</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}