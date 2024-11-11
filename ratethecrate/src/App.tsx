import React, { useState } from 'react';
import { deletePackages, getPackageRate } from './api';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';
import * as types from '../../src/apis/types.js';

//run app by cding into ratethecrate then running npm start

//pop up variables
let title = ""
let message = ``

//pop up
const Modal: React.FC<{ isVisible: boolean, onClose: () => void, ratingData: types.PackageRating | null, title: string, message: string }> = ({ isVisible, onClose, ratingData, title, message }) => {
  const handleClose = () => {
    onClose(); // Close the modal
  };

  if (!isVisible) return null;

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <button className="closeButton" onClick={handleClose}>&times;</button>
        <h2>{title}</h2>
        {ratingData ? (
          <div>
            <p dangerouslySetInnerHTML={{ __html: message }} />
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

//main app
const App: React.FC = () => {
  //variables to hold
  const [searchValue, setSearchValue] = useState('');
  const [isSearchSinking, setIsSearchSinking] = useState(false);
  const [isUploadSinking, setIsUploadSinking] = useState(false);
  const [isDeleteSinking, setIsDeleteSinking] = useState(false);
  const [sinkingButtons, setSinkingButtons] = useState<{ [key: string]: boolean }>({});
  const [ratePackages, setRatePackages] = useState<{ [key: string]: types.PackageRating }>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRating, setCurrentRating] = useState<types.PackageRating | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState(''); // Message state

  const packages = [
    { id: "12345", name: 'Browserify' }
    // { id: "2", name: 'Cloudinary' },
    // { id: "3", name: 'Lodash' }
  ]

  //helper functions
  const handleSinkingClick = (id: string, action: string) => {
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

    if (action === "package") {
      handlePackageClick()
    }
    else if (action === "download") {
      handleDownloadClick()
    }
    else if (action === "update") {
      handleUpdateClick()
    }
    else if (action === "rate") {
      handleRateClick(id)
    }
    else if (action === "cost") {
      handleCostClick()
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

  const handleDeleteClick = () => {
    setIsDeleteSinking(true);
    setTimeout(() => {
      setIsDeleteSinking(false);
    }, 200);

    deletePackages() //call function to delete all packages
    .then((data) => {
      setTitle("");
      setMessage(data.message);
      setIsModalVisible(true);
    })
  };

  const handlePackageClick = () => { alert(`Package Button clicked!`); }
  const handleDownloadClick = () => { alert(`Download Button clicked!`); }
  const handleUpdateClick = () => { alert(`Update Button clicked!`); }

  const handleRateClick = ( id: string ) => { 
    getPackageRate(id) //call function to get that package rate
    .then((data) => {
      setRatePackages((prevState) => ({ //set the rate of the package
        ...prevState,
        [id]: data.rating,
      }));
      setCurrentRating(data.rating); // Set the rating data for the modal

      setTitle("Package Rating")
      setMessage(`Bus Factor: ${data.rating["BusFactor"]} <br />
      Bus Factor Latency: ${data.rating["BusFactorLatency"]} <br />
      Correctness: ${data.rating["Correctness"]} <br />
      Correctness Latency: ${data.rating["CorrectnessLatency"]} <br />
      Ramp Up: ${data.rating["RampUp"]} <br />
      Ramp Up Latency: ${data.rating["RampUpLatency"]} <br />
      Responsive Maintainer: ${data.rating["ResponsiveMaintainer"]} <br />
      Responsive Maintainer Latency: ${data.rating["ResponsiveMaintainerLatency"]} <br />
      License Score: ${data.rating["LicenseScore"]} <br />
      License Score Latency: ${data.rating["LicenseScoreLatency"]} <br />
      Good Pinning Practice: ${data.rating["GoodPinningPractice"]} <br />
      Good Pinning Practice Latency: ${data.rating["GoodPinningPracticeLatency"]} <br />
      Pull Request: ${data.rating["PullRequest"]} <br />
      Pull Request Latency: ${data.rating["PullRequestLatency"]} <br />
      Net Score: ${data.rating["NetScore"]} <br />
      Net Score Latency: ${data.rating["NetScoreLatency"]} <br />`)
      setIsModalVisible(true); // Show the modal
    })
  }

  const handleCostClick = () => { alert(`Cost Button clicked!`); }

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

        <button
          title="Delete"
          aria-label="Delete All Packages"
          className={`uploadButton ${isDeleteSinking ? 'sunk' : ''}`}
          onClick={handleDeleteClick}
        >
          <i className="fas fa-trash" aria-hidden="true"></i>
        </button>

        <section className="darkBlueBox">
          <ul>
            {packages.map((product) => (
              <li key={product.id}>
                <div className="lightBlueBox">
                  <span>{product.name}</span>

                  {/* Display rating */}
                  <span className="rating">
                    {ratePackages[product.id] !== undefined ? `Rating: ${ratePackages[product.id]["NetScore"]}/1` : ''}
                  </span>

                  <div className="rightAligned">
                    <button
                      title='Package'
                      aria-label={`Link to ${product.name}`}
                      className={`packageButtons ${sinkingButtons[`${product.id}-package`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.id, 'package')}
                    >
                      <i className="fas fa-box-open" aria-hidden="true"></i>
                    </button>
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
                    <button
                      title='Cost'
                      aria-label={`Cost of ${product.name}`}
                      className={`packageButtons ${sinkingButtons[`${product.id}-cost`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.id, 'cost')}
                    >
                      <i className="fas fa-dollar-sign" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
        {/* Pop Up */}
        <Modal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          ratingData={currentRating}
          title={title}
          message={message}
        />
      </main>
    </div>
  );
};

export default App;