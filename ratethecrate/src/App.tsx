import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

//run app by cding into ratethecrate then running npm start

const App: React.FC = () => {
  //variables to hold
  const [isSearchSinking, setIsSearchSinking] = useState(false);
  const [isUploadSinking, setIsUploadSinking] = useState(false);
  const [isDownloadSinking, setIsDownloadSinking] = useState(false);
  const [isUpdateSinking, setIsUpdateSinking] = useState(false);
  const [isRateSinking, setIsRateSinking] = useState(false);

  const [searchValue, setSearchValue] = useState('');

  const packages = [
    { id: 1, name: 'Browserify' },
    { id: 2, name: 'Cloudinary' },
    { id: 3, name: 'Lodash' }
  ]

  //helper functions
  const handleSearchClick = () => {
    setIsSearchSinking(true);  //handle button sinking effect
    setTimeout(() => {
      setIsSearchSinking(false);
    }, 200);

    alert(`Search Button clicked!`);
  };

  const handleUploadClick = () => {
    setIsUploadSinking(true);  //handle button sinking effect
    setTimeout(() => {
      setIsUploadSinking(false);
    }, 200);

    alert(`Upload Button clicked!`);
  };

  const handleDownloadClick = (id: number) => {
    setIsDownloadSinking(true); //handle button sinking effect
    setTimeout(() => {
      setIsDownloadSinking(false);
    }, 200);

    alert(`Download Button for item with ID ${id} clicked!`);
  };

  const handleUpdateClick = (id: number) => {
    setIsUpdateSinking(true); //handle button sinking effect
    setTimeout(() => {
      setIsUpdateSinking(false);
    }, 200);

    alert(`Update Button for item with ID ${id} clicked!`);
  };

  const handleRateClick = (id: number) => {
    setIsRateSinking(true); //handle button sinking effect
    setTimeout(() => {
      setIsRateSinking(false);
    }, 200);

    alert(`Rate Button for item with ID ${id} clicked!`);
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
                <div className='lightBlueBox'>
                  <span>{product.name} </span>
                  <div className='rightAligned'>
                    <button className={`packageButtons ${isDownloadSinking ? 'sunk' : ''}`} onClick={() => handleDownloadClick(product.id)}>
                      <i className="fas fa-download"></i>
                    </button>
                    <button className={`packageButtons ${isUpdateSinking ? 'sunk' : ''}`} onClick={() => handleUpdateClick(product.id)}>
                      <i className="fas fa-sync"></i>
                    </button>
                    <button  className={`packageButtons ${isRateSinking ? 'sunk' : ''}`}onClick={() => handleRateClick(product.id)}>
                      <i className="fas fa-star"></i>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
};

export default App;
