import { useParams } from 'react-router';
import './Room.css'
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import peer from '../service/peer.js'
import ReactPlayer from 'react-player'

export default function Room() {
  const path = useRef();
  const { username, Room_id } = useParams();
  let [remoteId, setRemoteId] = useState(null);
  let [myStream, setMystream] = useState(null);
  let [myName,setMyname]=useState("");
  let [remoteName,setRemoteName]=useState("");
  let [remoteStream, setRemoteStream] = useState(null);
  let [videoAvail,setVideoAvail]=useState(true);
  let [audioAvail,setAudioAvail]=useState(true);

  let [callVisible,setCallVisible]=useState(false); // s-12
  let [remoteCallvisible,setRemoteCallvisible]=useState(false); ///s-15
  let [sendVisible,setSendVisible]=useState(false); // s-15

  let [options,setOptions]=useState(false);

  const socket = useSocket();
  useEffect(() => {
    if (path) {
      path.current.innerText = `Room-ID : ${Room_id}`;
      setMyname(username);
    }
  }, []);

  const EnableStream=useCallback(async()=>{
    try 
    {
      const stream=await navigator.mediaDevices.getUserMedia({video: videoAvail , audio: audioAvail});
      if(stream)
      {
        setMystream(stream);
        return true;
      }
    }catch(err)
    {
      alert(err);
      return false;
    }
  },[videoAvail,audioAvail]);


  const hadleUserCall = useCallback(async () => {
     let flag=await EnableStream();
     if(flag)
     {
      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteId, offer }); //  s-12 offer sending // 
      setCallVisible(()=>false);
      setOptions(()=>true);
     }
  }, [socket,remoteId]);


  // socket code /// 

  const sendStream = useCallback(()=>{
    if(!myStream) 
    {
      console.log(myStream);
      console.log('send-stream empty');
      return;
    }
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
    setSendVisible(false);
    console.log('sending-my-stram');
},[myStream]);

  const MuteVideo=useCallback(()=>{
    if(myStream)
    {
      setVideoAvail(()=>!videoAvail);
      myStream.getTracks()[1].enabled=!videoAvail;
      setMystream(()=>myStream);
    }
  },[myStream,videoAvail]);

  const MuteAudio=useCallback(()=>{
    if(myStream)
    {
      setAudioAvail(()=>!audioAvail);
      myStream.getTracks()[0].enabled=!audioAvail;
      setMystream(()=>myStream);
    }
  },[audioAvail,myStream]);

  useEffect(() => {
    peer.peer.addEventListener('track', (event) => {
      const stream = event.streams;
      setRemoteStream(stream[0]);
      console.log("got stream");
      console.log(stream);
    })
  }, []);

  const handleReNego=useCallback(async()=>{
    const offer=await peer.getOffer();
    console.log(`client : ${remoteId}`);
    socket.emit("peer:nego:call",{to : remoteId , offer});
  },[socket,remoteId]);
  
  useEffect(()=>{
    peer.peer.addEventListener('negotiationneeded',handleReNego);
    return ()=>{
      peer.peer.removeEventListener('negotiationneeded',handleReNego);
    }
  },[remoteId,socket]);

  const handleJoin = useCallback(({ email, id }) => {
      if(!remoteId)
      {
        setRemoteId(()=>id);
        setRemoteName(()=>email);
        setCallVisible(()=>true);
      }
      else console.log("someone try to join this channel");
  }, [remoteId]);

  const hadleOffer = useCallback(async ({ from, offer , name }) => {
    setRemoteId(()=>from);
    setRemoteName(()=>name);
     let flag=await EnableStream(); 
     if(flag)
     {
      const ans = await peer.getAns(offer);
      socket.emit("call:accepted", { to: from, ans });
      setSendVisible(()=>true);
      setOptions(()=>true);
     }
     else 
     {
       setRemoteCallvisible(true);
     }
  }, [socket]);

  const remoteSideCallhandle=useCallback(()=>{
    async()=>{
      let flag=await EnableStream();
      if(flag)
      {
        const ans = await peer.getAns(offer);
        socket.emit("call:accepted", { to: remoteId, ans });
        setRemoteCallvisible(()=>false);
        setSendVisible(()=>true);
        setOptions(()=>true);
      }
      else 
      {
        alert("Permission Denied");
      }
    }
  },[socket,remoteId]);

  const handleAns = useCallback(async ({ from, ans }) => {
    await peer.setRemoteDescription(ans);
    sendStream();
    console.log("call accepted");
  }, [socket,myStream]);

  const handleNegoOffer=useCallback(async({from,offer})=>{
    const ans=await peer.getAns(offer);
    socket.emit("peer:nego:ans",{to : from , ans});
  },[socket]);

  const hadleNegoAns=useCallback(async({from,ans})=>{
    await peer.setRemoteDescription(ans);
  },[]);

  useEffect(() => {
    socket.on("user:joined", handleJoin); // s-15 joined // 

    socket.on("incoming:call", hadleOffer); // accecpted offer s-15 side // 

    socket.on("call:grand", handleAns) // accepted and from s-15 // s12

    socket.on("peer:nego:incoming",handleNegoOffer); // s-15 

    socket.on("peer:nego:accepted",hadleNegoAns); // s-12 

    return () => {
      socket.off("user:joined", handleJoin);
      socket.off("incoming:call", hadleOffer);
      socket.off("call:grand", handleAns);
      socket.off("peer:nego:incoming",handleNegoOffer);
      socket.off("peer:nego:accepted",hadleNegoAns)
    }
  }, [socket,handleJoin,hadleOffer,handleAns,hadleOffer,hadleNegoAns]);
  return (
    <div className="room-con">
      <p className="room-id" ref={path}>Room-ID : b948f608-bb98-4bf8-80b5-600f27028d19</p>
      {remoteId ?  <p className="status" style={{color:"#06c83c"}}>Connected</p> : <p className="status" style={{color:"red"}}>Disconnected</p> }
      <div className="video-con flex">
        <div className="video-player">
          { !audioAvail ? <i className="fa-solid fa-microphone-slash mute"></i> : <i className="fa-solid fa-microphone mute"></i>}
          <ReactPlayer className='video' url={myStream} playing={true} />
          <p className='username'>{myName}</p>
        </div>
        {remoteId && <div className="video-player">
          <i className="fa-solid fa-microphone mute"></i>
          <ReactPlayer className='video'  url={remoteStream} playing={true} />
          <p className='username'>{remoteName}</p>
        </div>}
        {callVisible && <button className='btn btn-primary' onClick={hadleUserCall}>Connect</button>}
        {remoteCallvisible && <button className='btn btn-primary' onClick={remoteSideCallhandle}>Connect</button>}
        {sendVisible && <button className='btn btn-primary'  onClick={sendStream}>sendStram</button>}
      </div>
      {options &&<div className="controls flex">
       <span onClick={MuteVideo}>{videoAvail ? <i className="fa-solid fa-video"></i> : <i className="fa-solid fa-video-slash"></i>}</span>
        <span className="flex dic"><i className="fa-solid fa-phone"></i></span>
        <span onClick={MuteAudio}>{audioAvail ? <i className="fa-solid fa-microphone"></i> : <i className="fa-solid fa-microphone-slash"></i>}</span>
      </div>}
    </div>
  );
}