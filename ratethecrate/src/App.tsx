import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

//run app by cding into ratethecrate then running npm start

const App: React.FC = () => {
  //variables to hold
  const [searchValue, setSearchValue] = useState('');

  //helper functions
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };


  return (
    <div className="App">
      <h1>Rate the Crate</h1>
      <input //search bar
        className="searchBar"
        type="text"
        value={searchValue}
        onChange={handleChange}
        placeholder="Search Packages..."
      />
      <button className='searchButton'>
        <i className="fas fa-search"></i>
      </button>
    </div>
  );
};

export default App;
