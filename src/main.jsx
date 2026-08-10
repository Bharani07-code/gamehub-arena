import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const initialPlayers = [
  {name:"Nova", rating:2850, level:31, avatar:"N"},
  {name:"Shadow", rating:2720, level:28, avatar:"S"},
  {name:"Pixel", rating:2650, level:25, avatar:"P"},
  {name:"You", rating:1250, level:8, avatar:"Y"}
];

function TicTacToe({onWin}) {
  const [board,setBoard] = useState(Array(9).fill(""));
  const [turn,setTurn] = useState("X");
  const [status,setStatus] = useState("Your turn");
  const winner = getWinner(board);

  function play(i){
    if(board[i] || winner) return;
    const next=[...board]; next[i]=turn; setBoard(next);
    const w=getWinner(next);
    if(w){ setStatus(w==="X"?"You win!":"Opponent wins!"); if(w==="X") onWin(); return; }
    if(next.every(Boolean)){setStatus("Draw!"); return;}
    setTurn(turn==="X"?"O":"X");
    setStatus(turn==="X"?"Opponent's turn":"Your turn");
  }
  function reset(){setBoard(Array(9).fill(""));setTurn("X");setStatus("Your turn")}
  return <div className="game-card">
    <div className="game-head"><div><h2>❌⭕ Tic-Tac-Toe</h2><p>{status}</p></div><button onClick={reset}>Reset</button></div>
    <div className="board">{board.map((x,i)=><button key={i} onClick={()=>play(i)}>{x}</button>)}</div>
  </div>
}

function getWinner(b){
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const [a,c,d] of lines) if(b[a] && b[a]===b[c] && b[a]===b[d]) return b[a];
  return null;
}

function App(){
  const [page,setPage]=useState("home");
  const [players,setPlayers]=useState(initialPlayers);
  const [xp,setXp]=useState(640);
  const [online,setOnline]=useState(true);

  useEffect(()=>{ const saved=localStorage.getItem("gamehub"); if(saved){const x=JSON.parse(saved);setXp(x.xp??640);setPlayers(x.players??initialPlayers)}} ,[]);
  useEffect(()=>localStorage.setItem("gamehub",JSON.stringify({xp,players})),[xp,players]);

  function win(){
    setXp(v=>v+100);
    setPlayers(p=>p.map(x=>x.name==="You"?{...x,rating:x.rating+25}:x));
  }

  const you=players.find(x=>x.name==="You");
  const rank=[...players].sort((a,b)=>b.rating-a.rating).findIndex(x=>x.name==="You")+1;

  return <div className="app">
    <header>
      <button className="brand" onClick={()=>setPage("home")}>🎮 <span>GameHub</span></button>
      <nav>
        <button className={page==="home"?"active":""} onClick={()=>setPage("home")}>Home</button>
        <button className={page==="play"?"active":""} onClick={()=>setPage("play")}>Play</button>
        <button className={page==="leaderboard"?"active":""} onClick={()=>setPage("leaderboard")}>Leaderboard</button>
        <button className={page==="profile"?"active":""} onClick={()=>setPage("profile")}>Profile</button>
      </nav>
      <div className="status"><span className={online?"dot":""}></span>{online?"Online":"Offline"}</div>
    </header>

    <main>
      {page==="home" && <Home setPage={setPage} you={you} rank={rank}/>}
      {page==="play" && <Play onWin={win}/>}
      {page==="leaderboard" && <Leaderboard players={players}/>}
      {page==="profile" && <Profile you={you} xp={xp} rank={rank}/>}
    </main>
  </div>
}

function Home({setPage,you,rank}){
  return <section>
    <div className="hero">
      <div><div className="eyebrow">ONE APP • MANY GAMES</div><h1>Play. Challenge.<br/><span>Climb the Arena.</span></h1>
      <p>GameHub is your all-in-one competitive playground for games, puzzles, challenges and global rankings.</p>
      <button className="primary" onClick={()=>setPage("play")}>Start Playing →</button></div>
      <div className="hero-card"><div className="avatar big">Y</div><h3>You</h3><strong>{you.rating} Rating</strong><p>Rank #{rank} • Level {you.level}</p></div>
    </div>
    <h2>Choose your game</h2>
    <div className="games">
      <Game icon="♟️" title="Chess" text="Classic strategy" locked/>
      <Game icon="❌⭕" title="Tic-Tac-Toe" text="Quick 1v1 battles" onClick={()=>setPage("play")}/>
      <Game icon="🧩" title="Daily Puzzle" text="New brain challenge" locked/>
      <Game icon="🧠" title="Quiz Arena" text="Test your knowledge" locked/>
    </div>
    <div className="features"><span>⚔️ Friend Challenges</span><span>🏆 Global Leaderboard</span><span>🎖️ Achievements</span><span>🔥 Seasons</span></div>
  </section>
}
function Game({icon,title,text,onClick,locked}){
  return <button className="game-tile" onClick={onClick}><div className="game-icon">{icon}</div><div><h3>{title} {locked&&<small>SOON</small>}</h3><p>{text}</p></div><b>→</b></button>
}
function Play({onWin}){
  return <section><div className="section-title"><div><div className="eyebrow">GAME ARENA</div><h1>Pick a battle</h1></div><span className="pill">🟢 Matchmaking ready</span></div>
    <div className="games play-grid">
      <Game icon="❌⭕" title="Tic-Tac-Toe" text="Play now" onClick={()=>{}}/>
      <Game icon="♟️" title="Chess" text="Coming soon" locked/>
      <Game icon="🧩" title="Puzzle" text="Coming soon" locked/>
    </div>
    <TicTacToe onWin={onWin}/>
  </section>
}
function Leaderboard({players}){
  const sorted=[...players].sort((a,b)=>b.rating-a.rating);
  return <section><div className="section-title"><div><div className="eyebrow">COMPETITIVE</div><h1>Global Leaderboard</h1></div><span className="pill">Season 1</span></div>
    <div className="table">{sorted.map((p,i)=><div className={"row "+(p.name==="You"?"me":"")} key={p.name}><strong>#{i+1}</strong><div className="avatar">{p.avatar}</div><div className="player"><b>{p.name}</b><span>Level {p.level}</span></div><strong>{p.rating.toLocaleString()}</strong><span className="rank-badge">{i===0?"MASTER":i===1?"DIAMOND":i===2?"PLATINUM":"BRONZE"}</span></div>)}</div>
  </section>
}
function Profile({you,xp,rank}){
  return <section><div className="profile-card"><div className="avatar huge">Y</div><div><div className="eyebrow">PLAYER PROFILE</div><h1>{you.name}</h1><p>Level {you.level} • Arena Rank #{rank}</p></div></div>
    <div className="stats"><Stat n={you.rating} l="Rating"/><Stat n={xp} l="XP"/><Stat n="12" l="Wins"/><Stat n="4" l="Achievements"/></div>
    <div className="notice"><b>🚀 More features coming</b><p>Online Chess, daily puzzles, tournaments, seasons and friend challenges are planned for the next versions.</p></div>
  </section>
}
function Stat({n,l}){return <div className="stat"><strong>{n}</strong><span>{l}</span></div>}

createRoot(document.getElementById("root")).render(<App/>);
