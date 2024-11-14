import React, { useState } from 'react';
import { deletePackages, getAllPackages, getPackage, getPackageCost, getPackageRate, getCertainPackages, updatePackage } from './api';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';
import LoadingOverlay from './LoadingOverlay';
import * as types from '../../src/apis/types.js';

//run app by cding into ratethecrate then running npm start

//pop up
const Modal: React.FC<{ isVisible: boolean, onClose: () => void, title: string, message: string }> = ({ isVisible, onClose, title, message }) => {
  const handleClose = () => {
    onClose(); // Close the modal
  };

  if (!isVisible) return null;

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <button className="closeButton" onClick={handleClose}>&times;</button>
        <h2>{title}</h2>
        {message ? (
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
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<types.PackageMetadata[]>([]);
  const [nameValue, setNameValue] = useState('');
  const [versionValue, setVersionValue] = useState('');
  const [regexValue, setRegexValue] = useState('');
  const [sinkingButtons, setSinkingButtons] = useState<{ [key: string]: boolean }>({});
  const [currPackage, setCurrPackage] = useState<{ [key: string]: types.Package }>({});
  const [ratePackages, setRatePackages] = useState<{ [key: string]: types.PackageRating }>({});
  const [costPackages, setCostPackages] = useState<{ [key: string]: types.PackageCost }>({});
  const [showTwoSearchBars, setShowTwoSearchBars] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState(''); // Message state

  // getAllPackages()
  //   .then((data) => {
  //     setPackages(data)
  //     })

  //helper functions
  const handleSinkingClick = async (id: string, action: string) => {
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

    setTimeout(() => setIsLoading(true), 1);

    try {
      if (action === "search") await handleSearchClick();
      else if (action === "upload") await handleUploadClick();
      else if (action === "delete") await handleDeleteClick();
      else if (action === "package") await handlePackageClick(id);
      else if (action === "download") await handleDownloadClick();
      else if (action === "update") await handleUpdateClick(id);
      else if (action === "rate") await handleRateClick(id);
      else if (action === "cost") await handleCostClick(id);
    } catch (error) {
      console.error("Error handling action:", error);
      setTitle("Error");
      setMessage("An error occurred while processing your request.");
      setIsModalVisible(true);
    }
  };

  const handleSearchClick = () => {
    if (nameValue !== "" && versionValue === ""){
      getAllPackages(nameValue, undefined)
      .then((data) => {
        setPackages(data)
      })
      .finally(() => {
        setIsLoading(false)
      })
    }
    else if (nameValue === "" && versionValue !== ""){
      getAllPackages("string", versionValue) //change name?
      .then((data) => {
        setPackages(data)
      })
      .finally(() => {
        setIsLoading(false)
      })
    }
    else if (regexValue !== ""){
      getCertainPackages(regexValue)
      .then((data) => {
        setPackages(data)
      })
      .finally(() => {
        setIsLoading(false)
      })
    }
    else {
      getAllPackages("*", undefined)
      .then((data) => {
        setPackages(data)
        })
      .finally(() => {
        setIsLoading(false)
      })
    }
  };

  const handleUploadClick = () => { setIsLoading(false) };

  const handleDeleteClick = () => {
    deletePackages() //call function to delete all packages
    .then((data) => {
      setTitle("");
      setMessage(data.message);
      setIsModalVisible(true);
      setPackages([]);
    })
    .finally(() => {
      setIsLoading(false)
    })
  };

  const handlePackageClick = ( id:string ) => { 
      getPackage(id)
      .then((data) => {
        setCurrPackage((prevState) => ({ //set the rate of the package
          ...prevState,
          [id]: data,
        }));
      setTitle(data.metadata.Name)
      setMessage(`Id: ${data.metadata.ID} <br />
        Version: ${data.metadata.Version} <br />
        URL: <a href="${data.data.URL}" target="_blank" rel="noopener noreferrer">${data.data.URL}</a> `)
      setIsModalVisible(true) // Show the modal
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const handleDownloadClick = () => { alert(`Download Button clicked!`); }

  const handleUpdateClick = ( id:string ) => { 
    setIsLoading(false) 
    alert(
    updatePackage(id)
      .then((data) => {
        setCurrPackage((prevState) => ({ //set the rate of the package
          ...prevState,
          [id]: data,
        }));
      })
      .finally(() => {
        setIsLoading(false)
      })
  )}

  const handleRateClick = ( id: string ) => { 
    getPackageRate(id) //call function to get that package rate
    .then((data) => {
      setRatePackages((prevState) => ({ //set the rate of the package
        ...prevState,
        [id]: data.rating,
      }));
      setTitle("Package Rating")
      setMessage(`Bus Factor: ${data.rating["BusFactor"]} <br />
        Correctness: ${data.rating["Correctness"]} <br />
        Ramp Up: ${data.rating["RampUp"]} <br />
        Responsive Maintainer: ${data.rating["ResponsiveMaintainer"]} <br />
        License Score: ${data.rating["LicenseScore"]} <br />
        Good Pinning Practice: ${data.rating["GoodPinningPractice"]} <br />
        Pull Request: ${data.rating["PullRequest"]} <br />
        Net Score: ${data.rating["NetScore"]} <br /> <br />
        Bus Factor Latency: ${data.rating["BusFactorLatency"]} <br />
        Correctness Latency: ${data.rating["CorrectnessLatency"]} <br />
        Ramp Up Latency: ${data.rating["RampUpLatency"]} <br />
        Responsive Maintainer Latency: ${data.rating["ResponsiveMaintainerLatency"]} <br />
        License Score Latency: ${data.rating["LicenseScoreLatency"]} <br />
        Good Pinning Practice Latency: ${data.rating["GoodPinningPracticeLatency"]} <br />
        Pull Request Latency: ${data.rating["PullRequestLatency"]} <br />
        Net Score Latency: ${data.rating["NetScoreLatency"]}`)
      setIsModalVisible(true); // Show the modal
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const handleCostClick = ( id : string ) => { 

    getPackageCost(id) //call function to get that package cost
    .then((data) => {
      setCostPackages((prevState) => ({ //set the cost of the package
        ...prevState,
        [id]: data.cost,
      }));
      setTitle("Package Cost")
      if (data.cost?.id?.standaloneCost !== undefined) { //dependency determines if standlone cost is not undefined
        setMessage(`Standalone Cost: ${data.cost[id].standaloneCost} <br />
          Total Cost: ${data.cost[id].totalCost}`); // Set the cost data for the modal
      }
      else{
        setMessage(`Total Cost: ${data.cost[id].totalCost}`); // Set the cost data for the modal
      }
      setIsModalVisible(true); // Show the modal
    })
    .finally(() => {
      setIsLoading(false)
    })
   }

   const handleToggleChange = () => {
    setShowTwoSearchBars(prevState => !prevState); // Toggle between two search bars or one
    setNameValue("");
    setVersionValue("");
    setRegexValue("");
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(event.target.value);
  };

  const handleVersionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVersionValue(event.target.value);
  };

  const handleRegexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRegexValue(event.target.value);
  };

  return (
    <div className="App">
      {isLoading && <LoadingOverlay />}
      <header>
        <h1>Rate the Crate</h1>
      </header>
      <main>

        <label className="switch">
          <input 
            type="checkbox" 
            checked={showTwoSearchBars} 
            onChange={handleToggleChange}
          />
          <span className="slider"></span>
        </label>

        {showTwoSearchBars && (
          <React.Fragment>
            <input
              id="searchBar"
              className="searchBar"
              type="text"
              value={regexValue}
              onChange={handleRegexChange}
              placeholder="Search by Regular Expression..."
              aria-label="Search Bar"
            />
          </React.Fragment>
        )}

        {!showTwoSearchBars && (
          <React.Fragment>
            <input
              id="searchBar"
              className="searchBar2"
              type="text"
              value={nameValue}
              onChange={handleNameChange}
              placeholder="Search by Name..."
              aria-label="Search Bar"
            />
            <input
              id="searchBar2"
              className="searchBar2"
              type="text"
              value={versionValue}
              onChange={handleVersionChange}
              placeholder="Search by Version..."
              aria-label="Search Bar 2"
            />
          </React.Fragment>
        )}
        <button
              title="Search"
              aria-label="Search"
              className={`searchButton ${sinkingButtons[`-search`] ? 'sunk' : ''}`}
              onClick={() => handleSinkingClick("", 'search')}
            >
              <i className="fas fa-search" aria-hidden="true"></i>
        </button>

        <button
          title="Upload"
          aria-label="Upload Package"
          className={`uploadButton ${sinkingButtons[`-upload`] ? 'sunk' : ''}`}
          onClick={() => handleSinkingClick("", 'upload')}
        >
          <i className="fas fa-upload" aria-hidden="true"></i>
        </button>

        <button
          title="Reset"
          aria-label="Reset All Packages"
          className={`uploadButton ${sinkingButtons[`-delete`] ? 'sunk' : ''}`}
          onClick={() => handleSinkingClick("", 'delete')}
        >
          <i className="fas fa-trash" aria-hidden="true"></i>
        </button>

        <section className="darkBlueBox">
          <ul>
            {packages.map((product) => (
              <li key={product.ID}>
                <div className="lightBlueBox">
                  <span>{product.Name}</span>

                  <div className="rightAligned">
                    <button
                      title='Package'
                      aria-label={`Link to ${product.Name}`}
                      className={`packageButtons ${sinkingButtons[`${product.ID}-package`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.ID, 'package')}
                    >
                      <i className="fas fa-box-open" aria-hidden="true"></i>
                    </button>
                    <button
                      title='Download'
                      aria-label={`Download ${product.Name}`}
                      className={`packageButtons ${sinkingButtons[`${product.ID}-download`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.ID, 'download')}
                    >
                      <i className="fas fa-download" aria-hidden="true"></i>
                    </button>
                    <button
                      title='Update'
                      aria-label={`Update ${product.Name}`}
                      className={`packageButtons ${sinkingButtons[`${product.ID}-update`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.ID, 'update')}
                    >
                      <i className="fas fa-sync" aria-hidden="true"></i>
                    </button>
                    <button
                      title='Rate'
                      aria-label={`Rate ${product.Name}`}
                      className={`packageButtons ${sinkingButtons[`${product.ID}-rate`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.ID, 'rate')}
                    >
                      <i className="fas fa-star" aria-hidden="true"></i>
                    </button>
                    <button
                      title='Cost'
                      aria-label={`Cost of ${product.Name}`}
                      className={`packageButtons ${sinkingButtons[`${product.ID}-cost`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.ID, 'cost')}
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
          title={title}
          message={message}
        />
      </main>
    </div>
  );
};

export default App;