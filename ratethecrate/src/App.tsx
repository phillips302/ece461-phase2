import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

//run app by cding into ratethecrate then running npm start

const App: React.FC = () => {
  //variables to hold
  const [searchValue, setSearchValue] = useState('');
  const [isSearchSinking, setIsSearchSinking] = useState(false);
  const [isUploadSinking, setIsUploadSinking] = useState(false);
  const [sinkingButtons, setSinkingButtons] = useState<{ [key: string]: boolean }>({});


  const packages = [
    { id: 1, name: 'Browserify' },
    { id: 2, name: 'Cloudinary' },
    { id: 3, name: 'Lodash' }
  ]

  //helper functions
  const handleSinkingClick = (id: number, action: string) => {
    const key = `${id}-${action}`;

    setSinkingButtons((prevState) => ({
      ...prevState,
      [key]: true,
    }));

    setTimeout(() => {
      setSinkingButtons((prevState) => ({
        ...prevState,
        [key]: false,
      }));
    }, 200);

    if (action === "download") {
      handleDownloadClick()
    }
    else if (action === "update") {
      handleUpdateClick()
    }
    else if (action === "rate") {
      handleRateClick()
    }
  };

  const handleSearchClick = () => {
    setIsSearchSinking(true);
    setTimeout(() => {
      setIsSearchSinking(false);
    }, 200);
  };

  const handleUploadClick = () => {
    setIsUploadSinking(true);
    setTimeout(() => {
      setIsUploadSinking(false);
    }, 200);
  };

  const handleDownloadClick = () => { alert(`Download Button clicked!`); }
  const handleUpdateClick = () => { alert(`Update Button clicked!`); }
  const handleRateClick = () => {alert(`Rate Button clicked!`);  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  return (
    <div className="App">
      <header>
        <h1>Rate the Crate</h1>
      </header>
      <main>
        <label htmlFor="searchBar" className="visually-hidden"></label>
        <input
          id="searchBar"
          className="searchBar"
          type="text"
          value={searchValue}
          onChange={handleChange}
          placeholder="Search Packages..."
          aria-label="Search Bar"
        />
        <button
          title="Search"
          aria-label="Search"
          className={`searchButton ${isSearchSinking ? 'sunk' : ''}`}
          onClick={handleSearchClick}
        >
          <i className="fas fa-search" aria-hidden="true"></i>
        </button>

        <button
          title="Upload"
          aria-label="Upload Package"
          className={`uploadButton ${isUploadSinking ? 'sunk' : ''}`}
          onClick={handleUploadClick}
        >
          <i className="fas fa-upload" aria-hidden="true"></i>
        </button>

        <section className="darkBlueBox">
          <ul>
            {packages.map((product) => (
              <li key={product.id}>
                <div className="lightBlueBox">
                  <span>{product.name}</span>
                  <div className="rightAligned">
                    <button
                      title='Download'
                      aria-label={`Download ${product.name}`}
                      className={`packageButtons ${sinkingButtons[`${product.id}-download`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.id, 'download')}
                    >
                      <i className="fas fa-download" aria-hidden="true"></i>
                    </button>
                    <button
                      title='Update'
                      aria-label={`Update ${product.name}`}
                      className={`packageButtons ${sinkingButtons[`${product.id}-update`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.id, 'update')}
                    >
                      <i className="fas fa-sync" aria-hidden="true"></i>
                    </button>
                    <button
                      title='Rate'
                      aria-label={`Rate ${product.name}`}
                      className={`packageButtons ${sinkingButtons[`${product.id}-rate`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.id, 'rate')}
                    >
                      <i className="fas fa-star" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default App;
