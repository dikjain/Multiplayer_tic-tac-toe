import React, { useEffect } from 'react'
import { useState } from 'react';
import Box from './Box';
import "./app.css"
import {io} from "socket.io-client"
import swal from "sweetalert2"

function App() {
    const [boxes , setboxes] = useState([[1,2,3],[4,5,6],[7,8,9]])
    const [gamestate,setgamestate] = useState(boxes)
    const [currentplayer,setcurrentplayer] = useState("circle")
    const [isfinished,setisfinished] = useState(false)
    const [finishedarraystate,setfinishedarraystate] = useState([])
    const [playonline,setplayonline] = useState(false)
    const [socket,setsocket] = useState(null)
    const [username,setusername] = useState("")
    const [opponent,setopponent] = useState(null)
    const [playingas,setplayingas] = useState(null)
    let newsocket= undefined

    const takeplayername = async()=>{

      const result = await swal.fire({
        title: "Enter your Username",
        input: "text",
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "You need to write something!";
          }
        }
      });
      return result
    }
    
    
    
     const letsplay = async()=>{
      const result =  await takeplayername();
      if(!result.isConfirmed) {
        return;
      }
      const name = result.value
      setusername(name);
       newsocket = io("https://multiplayer-tic-tac-toe-yhoq.onrender.com/",{
       autoConnect: true,
     });
     newsocket.emit("reqtoplay",{
       username: name
     })
     setsocket(newsocket);
    }

    useEffect(()=>{

      socket?.on("opponentleft", () => {
        swal.fire({
            title: "Opponent Left",
            text: "Your opponent has left the game. The game will reset.",
            icon: "info",
            confirmButtonText: "Ok"
        }).then(() => {
            // Reset the game state after opponent leaves
            setgamestate([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
            setcurrentplayer("circle");
            setisfinished(false);
            setfinishedarraystate([]);
            setopponent(null); // Wait for a new opponent
            setplayingas(null);
            socket?.emit("inqueue")
        });
    });


      if(socket){
      socket.on("connect",()=>{
        setplayonline(true); 
      })

      socket.on("opponentfound",(data)=>{  
        setplayingas(data.playingas)      
        setopponent(data.opponent)
               
      })
      
      socket.on("opponentNotfound",()=>{
        
      })
      
    }

      socket?.on("movefromopponent",(data)=>{
        setgamestate(data)
      })
    
    socket?.on("changecurrentplayer",(dat)=>{
      if(dat == "circle"){
        setcurrentplayer("cross")
      }else{
        setcurrentplayer("circle")
      }
    })
    
    },[currentplayer,socket])




    const checkwin = () => {
      // Check rows
      for (let i = 0; i < gamestate.length; i++) {
        if (gamestate[i][0] === gamestate[i][1] && gamestate[i][1] === gamestate[i][2] && (gamestate[i][0] === 'circle' || gamestate[i][0] === 'cross')) {
          setfinishedarraystate([i * 3, i * 3 + 1, i * 3 + 2]);
          return gamestate[i][0];
        }
      }
    
      // Check columns
      for (let i = 0; i < gamestate[0].length; i++) {
        if (gamestate[0][i] === gamestate[1][i] && gamestate[1][i] === gamestate[2][i] && (gamestate[0][i] === 'circle' || gamestate[0][i] === 'cross')) {
          setfinishedarraystate([i, i + 3, i + 6]);
          return gamestate[0][i];
        }
      }
    
      // Check diagonals
      if (gamestate[0][0] === gamestate[1][1] && gamestate[1][1] === gamestate[2][2] && (gamestate[0][0] === 'circle' || gamestate[0][0] === 'cross')) {
        setfinishedarraystate([0, 4, 8]);
        return gamestate[0][0];
      }
      if (gamestate[0][2] === gamestate[1][1] && gamestate[1][1] === gamestate[2][0] && (gamestate[0][2] === 'circle' || gamestate[0][2] === 'cross')) {
        setfinishedarraystate([2, 4, 6]);
        return gamestate[0][2];
      }
    
      // Check draw
      const isdraw = gamestate.flat().every((e) => e === 'circle' || e === 'cross');
      if (isdraw) {
        setisfinished('draw');
      }
    
      return null;
    };
    

useEffect(()=>{
      socket?.emit("movefromplayer",gamestate)
},[currentplayer,socket])
  

if(!playonline){
  return <div onClick={letsplay} className='w-screen relative flex items-center justify-center text-white h-screen bg-[#020202]'><button className='bg-yellow-300 text-[5vw] px-8 py-5 rounded-xl'>Play Online</button></div>
}
if(playonline && !opponent){
  return <div className='w-screen relative flex items-center justify-center text-white h-screen text-[5vw] bg-[#020202]'>Waiting for a opponent....</div>
}

  return (
    <div className='main  w-screen relative flex items-center justify-center text-white h-screen bg-[#020202]'>
      <h2 className='uu absolute tichead top-[5%] text-[5vw] px-5 p-3 rounded-xl  bg-gray-500'>Tic-Tac-Toe</h2>
      <h2 className={`uu absolute name top-[25%] left-[20%] ${isfinished?"bg-gray-500": currentplayer == playingas ?"circwin":"bg-gray-500"}  text-[2vw] px-5 p-3 rounded-xl  `}>{username}</h2>
      <h2 className={`uu absolute name top-[25%] right-[20%] text-[2vw] ${isfinished?"bg-gray-500": currentplayer == playingas ?"bg-gray-500":"crswon"} px-5 p-3 rounded-xl `}>{opponent}</h2>
      <div id="boxcont" className='w-[500px] translate-y-[5%]  grid grid-cols-3 h-[500px] relative'>
      {gamestate.map((rowbox,row)=> rowbox.map((q,i)=>(<Box 
      socket={socket}
      playingas={playingas}
      setplayingas={setplayingas}
      finishedarraystate={finishedarraystate}
      checkwin={checkwin}
      isfinished={isfinished}
      setisfinished={setisfinished}
      setgamestate={setgamestate}
      gamestate={gamestate}
       id={row *3+i}
        key={row *3+i}
        currentplayer={currentplayer}
        setcurrentplayer={setcurrentplayer}
         />)))}
      </div>
      {isfinished && isfinished !=="draw" && (<h2 className="uu lo absolute text-[5vw] bottom-[5%]"><span className={`${isfinished == "circle" ? "circtext":(isfinished == "cross" ? "crstext" : "")}`}>{isfinished.toUpperCase()}</span> Won The Game</h2>)}
      {isfinished =="draw" && (<h2 className="uu lo absolute text-[5vw] bottom-[5%]">It's a Draw</h2>)}
  </div>
)}

export default App