import React, { useState } from 'react';
import { deletePackages,
         getAllPackages,
         getPackage,
         getPackageCost,
         getPackageRate,
         getCertainPackages,
         updatePackage,
         uploadPackage,
         downloadPackage } from './api/api';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles/App.css';
import PopUp from './PopUp';
import UpdatePopUp from './UpdatePopUp';
import UploadPopUp from './UploadPopUp';
import DeletePopUp from './DeletePopUp';
import LoadingOverlay from './LoadingOverlay';
import * as types from '../../src/apis/types.js';

//run app by cding into ratethecrate then running npm start
//test

//main app
const App: React.FC = () => {
  //variables to hold
  const defaultPackage: types.Package = {
    data: {
      Name: '',
      Content: '',
      URL: '',
      debloat: false,
    },
    metadata: {
      Name: '',
      Version: '',
      ID: ''
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [sinkingButtons, setSinkingButtons] = useState<{ [key: string]: boolean }>({});
  const [showTwoSearchBars, setShowTwoSearchBars] = useState(false);
  const [isPopUpVisible, setPopUpVisible] = useState(false);
  const [isUpdatePopUpVisible, setUpdatePopUpVisible] = useState(false);
  const [isUploadPopUpVisible, setUploadPopUpVisible] = useState(false);
  const [isDeletePopUpVisible, setDeletePopUpVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<types.Package>(defaultPackage);

  
  const [nameValue, setNameValue] = useState('');
  const [versionValue, setVersionValue] = useState('');
  const [regexValue, setRegexValue] = useState('');
  
  const [packages, setPackages] = useState<types.PackageMetadata[]>([]);
  const [currPackage, setCurrPackage] = useState<{ [key: string]: types.Package }>({});
  const [ratePackages, setRatePackages] = useState<{ [key: string]: types.PackageRating }>({});
  const [costPackages, setCostPackages] = useState<{ [key: string]: types.PackageCost }>({});

  //helper functions
    const handleSearchClick = () => {
    if (nameValue !== "" && versionValue === "" && !showTwoSearchBars){
      getAllPackages(nameValue, undefined)
      .then((data) => {
        if ('message' in data) {
          setTitle("");
          setMessage(data.message);
          setPopUpVisible(true);
        } else {
          setPackages(data)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
    }
    else if (nameValue === "" && versionValue !== "" && !showTwoSearchBars){
      getAllPackages("*", versionValue)
      .then((data) => {
        if ('message' in data) {
          setTitle("");
          setMessage(data.message);
          setPopUpVisible(true);
        } else {
          setPackages(data)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
    }
    else if (nameValue !== "" && versionValue !== "" && !showTwoSearchBars){
      getAllPackages(nameValue, versionValue)
      .then((data) => {
        if ('message' in data) {
          setTitle("");
          setMessage(data.message);
          setPopUpVisible(true);
        } else {
          setPackages(data)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
    }
    else if (regexValue !== "" && showTwoSearchBars){
      getCertainPackages(regexValue)
      .then((data) => {
        if ('message' in data) {
          setTitle("");
          setMessage(data.message);
          setPopUpVisible(true);
        } else {
          setPackages(data)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
    }
    else {
      getAllPackages("*", undefined)
      .then((data) => {
        if ('message' in data) {
          setTitle("");
          setMessage(data.message);
          setPopUpVisible(true);
        } else {
          setPackages(data)
        }
        })
      .finally(() => {
        setIsLoading(false)
      })
    }
  };

  const handleUploadClick = (uploadedPackageData:types.PackageData) => { 
    setTimeout(() => setIsLoading(true), 1);
    uploadPackage(uploadedPackageData)
    .then((data) => {
      if ('message' in data) {
        setTitle("");
        setMessage(data.message);
        setPopUpVisible(true);
      } else {
        setPackages([data.metadata])
        setTitle("");
        setMessage("Package is uploaded.");
        setPopUpVisible(true);
      }
      })
    .finally(() => {
      setIsLoading(false)
    })
   };

  const handleDeleteClick = () => {
    deletePackages() //call function to delete all packages
    .then((data) => {
      setTitle("");
      setMessage(data.message);
      setPopUpVisible(true);
      setPackages([]);
    })
    .finally(() => {
      setIsLoading(false)
    })
  };

  const handlePackageClick = ( id:string ) => { 
      getPackage(id)
      .then((data) => {
        if ('message' in data) {
          setTitle("");
          setMessage(data.message);
          setPopUpVisible(true);
        } else {
          setCurrPackage((prevState) => ({
            ...prevState,
            [id]: data,
          }));
        setTitle(data.metadata.Name)
        setMessage(`Id: ${data.metadata.ID} <br />
          Version: ${data.metadata.Version} <br />
          URL: <a href="${data.data.URL}" target="_blank" rel="noopener noreferrer" style="color: white;">${data.data.URL}</a> `)
        setPopUpVisible(true)
        }
    })
    .finally(() => {
      setIsLoading(false)
    })
  }
  
  const handleDownloadClick = ( id:string ) => { 
      downloadPackage(id)
      .then((data) => {
        setTitle("");
        setMessage(data.message);
        setPopUpVisible(true);
        setPackages([]);
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  //const handleDownloadClick = () => { alert(`Download Button clicked!`); }

  const handleUpdateClick = (updatedPackage:types.Package) => { 
    setTimeout(() => setIsLoading(true), 1);
    updatePackage(updatedPackage)
    .then((data) => {
      setTitle("");
      setMessage(data.message)
      setPopUpVisible(true);
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const handleRateClick = ( id: string ) => { 
    getPackageRate(id) //call function to get that package rate
    .then((data) => {
      if ('message' in data) {
        setTitle("");
        setMessage(data.message);
        setPopUpVisible(true);
      } else {
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
        setPopUpVisible(true); // Show the modal
      }
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const handleCostClick = ( id : string ) => { 
    getPackageCost(id) //call function to get that package cost
    .then((data) => {
      if ('message' in data) {
        setTitle("");
        setMessage(data.message);
        setPopUpVisible(true);
      } else {
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
        setPopUpVisible(true); // Show the modal
      }
    })
    .finally(() => {
      setIsLoading(false)
    })
   }

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
      switch (action) {
        case "search":
          handleSearchClick();
          break;
        case "upload":
          setUploadPopUpVisible(true);
          break;
        case "delete":
          setDeletePopUpVisible(true);
          break;
        case "package":
          handlePackageClick(id);
          break;
        case "download":
          handleDownloadClick(id);
          break;
        case "update":
          getPackage(id)
          .then((data) => {
            if ('message' in data) {
            } else {
              setSelectedPackage(data)
            }
          })
          setUpdatePopUpVisible(true);
          break;
        case "rate":
          handleRateClick(id);
          break;
        case "cost":
          handleCostClick(id);
          break;
        default:
          console.warn(`Unhandled action: ${action}`);
          setTitle("Error");
          setMessage(`The action "${action}" is not recognized.`);
          setPopUpVisible(true);
      }
    } catch (error) {
      console.error(`Error handling action "${action}":`, error);
      setTitle("Error");
      setMessage("An error occurred while processing your request.");
      setPopUpVisible(true);
      setIsLoading(false)
    } 
    setIsLoading(false)   
  };

   const handleToggleChange = () => {
    setShowTwoSearchBars(prevState => !prevState); // Toggle between two search bars or one
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
      {isLoading && <LoadingOverlay aria-live="assertive" aria-label="Loading, please wait..." />}
      <header>
        <h1>Rate the Crate</h1>
      </header>
      <main>
        <label htmlFor="Searching">
        {/* Toggle Switch */}
        <label htmlFor="toggleSearchBars" className="switch">
          <input
            id="toggleSearchBars"
            type="checkbox"
            checked={showTwoSearchBars}
            onChange={handleToggleChange}
            aria-checked={showTwoSearchBars}
            aria-label="Switch between searching by Regular Expression and Name/Version"
            onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              // Toggle on Enter or Space
              e.preventDefault(); // Prevent scrolling for space key
              handleToggleChange();
            }
           }}
          />
          <span className="slider"></span>
        </label>
  
        {/* Search Bars */}
        {showTwoSearchBars && (
          <React.Fragment>
            <input
              id="regexSearchBar"
              className="searchBar"
              type="text"
              value={regexValue}
              onChange={handleRegexChange}
              placeholder="Search by Regular Expression..."
              aria-label="Search using a regular expression"
            />
          </React.Fragment>
        )}
        {!showTwoSearchBars && (
          <React.Fragment>
            <input
              id="nameSearchBar"
              className="searchBar2"
              type="text"
              value={nameValue}
              onChange={handleNameChange}
              placeholder="Search by Name..."
              aria-label="Search by package name"
            />
            <input
              id="versionSearchBar"
              className="searchBar2"
              type="text"
              value={versionValue}
              onChange={handleVersionChange}
              placeholder="Search by Version..."
              aria-label="Search by package version"
            />
          </React.Fragment>
        )}
  
        {/* Action Buttons */}
        <button
          title="Search"
          aria-label="Search packages"
          className={`searchButton ${sinkingButtons['-search'] ? 'sunk' : ''}`}
          onClick={() => handleSinkingClick("", 'search')}
        >
          <i className="fas fa-search" aria-hidden="true"></i>
        </button>
        </label>
  
        <button
          title="Upload"
          aria-label="Upload a package"
          className={`uploadButton ${sinkingButtons['-upload'] ? 'sunk' : ''}`}
          onClick={() => handleSinkingClick("", 'upload')}
        >
          <i className="fas fa-upload" aria-hidden="true"></i>
        </button>
  
        <button
          title="Reset"
          aria-label="Reset all packages"
          className={`uploadButton ${sinkingButtons['-delete'] ? 'sunk' : ''}`}
          onClick={() => handleSinkingClick("", 'delete')}
        >
          <i className="fas fa-trash" aria-hidden="true"></i>
        </button>
  
        {/* Package List */}
        <section className="darkBlueBox">
          <ul>
            {packages.map((product) => (
              <li key={product.ID}>
                <div className="lightBlueBox">
                  <span>{product.Name}</span>
                  <div className="rightAligned">
                    <button
                      title="Package"
                      aria-label={`View details for ${product.Name}`}
                      className={`packageButtons ${sinkingButtons[`${product.ID}-package`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.ID, 'package')}
                    >
                      <i className="fas fa-box-open" aria-hidden="true"></i>
                    </button>
                    <button
                      title="Download"
                      aria-label={`Download ${product.Name}`}
                      className={`packageButtons ${sinkingButtons[`${product.ID}-download`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.ID, 'download')}
                    >
                      <i className="fas fa-download" aria-hidden="true"></i>
                    </button>
                    <button
                      title="Update"
                      aria-label={`Update ${product.Name}`}
                      className={`packageButtons ${sinkingButtons[`${product.ID}-update`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.ID, 'update')}
                    >
                      <i className="fas fa-sync" aria-hidden="true"></i>
                    </button>
                    <button
                      title="Rate"
                      aria-label={`Rate ${product.Name}`}
                      className={`packageButtons ${sinkingButtons[`${product.ID}-rate`] ? 'sunk' : ''}`}
                      onClick={() => handleSinkingClick(product.ID, 'rate')}
                    >
                      <i className="fas fa-star" aria-hidden="true"></i>
                    </button>
                    <button
                      title="Cost"
                      aria-label={`View cost of ${product.Name}`}
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
  
        {/* PopUps */}
        <PopUp
          isVisible={isPopUpVisible}
          onClose={() => setPopUpVisible(false)}
          title={title}
          message={message}
          aria-live="polite"
        />
        <UpdatePopUp
          isVisible={isUpdatePopUpVisible}
          onClose={() => {
            setUpdatePopUpVisible(false);
            setIsLoading(false);
          }}
          title="Update Package Information"
          currPackage={selectedPackage}
          onSubmit={handleUpdateClick}
        />
        <UploadPopUp
          isVisible={isUploadPopUpVisible}
          onClose={() => {
            setUploadPopUpVisible(false);
            setIsLoading(false);
          }}
          title="Upload Package Information"
          onSubmit={handleUploadClick}
        />
        <DeletePopUp
          isVisible={isDeletePopUpVisible}
          onClose={() => {
            setDeletePopUpVisible(false);
            setIsLoading(false);
          }}
          onSubmit={handleDeleteClick}
        />
      </main>
    </div>
  );
};  

export default App;