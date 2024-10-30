import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

//run app by cding into ratethecrate then running npm start

const App: React.FC = () => {
  //variables to hold
  const [isSearchSinking, setIsSearchSinking] = useState(false);
  const [isUploadSinking, setIsUploadSinking] = useState(false);

  const [searchValue, setSearchValue] = useState('');

  const packages = [
    { id: 1, name: 'Browserify' },
    { id: 2, name: 'Cloudinary' },
    { id: 3, name: 'Lodash' }
  ]

  //helper functions
  const handleSearchClick = () => {
    setIsSearchSinking(true);
    // Reset sinking effect after a brief delay
    setTimeout(() => {
      setIsSearchSinking(false);
    }, 200); // 200ms corresponds to the duration of the sinking effect
  };

  const handleUploadClick = () => {
    setIsUploadSinking(true);
    // Reset sinking effect after a brief delay
    setTimeout(() => {
      setIsUploadSinking(false);
    }, 200); // 200ms corresponds to the duration of the sinking effect
  };

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
      <button className={`searchButton ${isSearchSinking ? 'sunk' : ''}`} onClick={handleSearchClick}>
        <i className="fas fa-search"></i>
      </button>
      <button className={`uploadButton ${isUploadSinking ? 'sunk' : ''}`} onClick={handleUploadClick}>
          <i className="fas fa-upload"></i>
      </button>
      <div className='darkBlueBox'>
        <ul>
          {packages.map((product) => (
            <li key={product.id}>
              <strong>{product.name}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
