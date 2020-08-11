import React from 'react';
import './App.css';
import Scoreboard from './components/Scoreboard';
import ScoreBoardContextProvider from './context/ScoreboardContext';

function App() {
  return (
    <div className="App">
      <ScoreBoardContextProvider>
        <Scoreboard />
      </ScoreBoardContextProvider>
    </div>
  );
}

export default App;
