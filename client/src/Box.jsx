import React, { useEffect, useState } from 'react'
import "./App.css"



function Box({playingas,setplayingas,id,socket,setgamestate,gamestate,checkwin,finishedarraystate,isfinished,setisfinished,currentplayer,setcurrentplayer}) {
    const circleSvg = (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>{" "}
          </g>
        </svg>
      );  
      const crossSvg = (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <path
            d="M19 5L5 19M5.00001 5L19 19"
            stroke="#fff"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>{" "}
        </g>
      </svg>
      );


      const [icon,seticon] = useState(null)

      const clickonsquare = ()=>{
        console.log(gamestate)
        if(isfinished){
            return
        }
        if(playingas == currentplayer &&gamestate.flat()[id]!="circle" && gamestate.flat()[id]!="cross"){
          
          if(!icon){
            if(currentplayer == "circle"){   
              seticon(circleSvg)
            }else{
              seticon(crossSvg)
            }
          }
          socket.emit("currentplayer", currentplayer)
           setgamestate((prev)=>{
            const newsstate = [...prev]
            let rowindex = Math.floor(id/3);
            let colindex = id%3;
            newsstate[rowindex][colindex] = currentplayer;
            return newsstate
        })

        
      }
        

      }


    useEffect(()=>{
        let winner = checkwin()
        if (winner){   
            setisfinished(winner)            
        }


        

        if(gamestate.flat()[id] == "circle"){
          seticon(circleSvg)
        }
        if(gamestate.flat()[id] == "cross"){
            seticon(crossSvg)
        }
        
        
        
    },[gamestate])

  return (
    <div onClick={clickonsquare} className={` ${finishedarraystate.includes(id) ? (isfinished == "circle"?"circwin":"crswon") :"box"}  ${isfinished =="draw" ? "bg-yellow-300":""}  rounded-xl ${isfinished ? "opop" : "box"} changewh h-[150px] w-[150px] flex items-center justify-center`}>{icon}</div>
  )
}

export default Box