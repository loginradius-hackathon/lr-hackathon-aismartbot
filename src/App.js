import React, { useState } from "react";
import "./index.css";

import Logo from "./logo.svg";
function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchTitle,setSearchTitle]= useState("")
  const mockData={
    "statsData": {
        "total": 236
    },
    "chartData": {
        "provider": [
            {
                "count": 207,
                "key": "raas",
                "data": [
                    {
                        "count": 5,
                        "key": "2022-05-01T00:00:00.000Z"
                    },
                    {
                        "count": 20,
                        "key": "2022-06-01T00:00:00.000Z"
                    },
                    {
                        "count": 24,
                        "key": "2022-07-01T00:00:00.000Z"
                    },
                    {
                        "count": 9,
                        "key": "2022-08-01T00:00:00.000Z"
                    },
                    {
                        "count": 2,
                        "key": "2022-09-01T00:00:00.000Z"
                    },
                    {
                        "count": 43,
                        "key": "2022-10-01T00:00:00.000Z"
                    },
                    {
                        "count": 3,
                        "key": "2022-11-01T00:00:00.000Z"
                    },
                    {
                        "count": 5,
                        "key": "2022-12-01T00:00:00.000Z"
                    },
                    {
                        "count": 8,
                        "key": "2023-01-01T00:00:00.000Z"
                    },
                    {
                        "count": 74,
                        "key": "2023-02-01T00:00:00.000Z"
                    },
                    {
                        "count": 6,
                        "key": "2023-03-01T00:00:00.000Z"
                    },
                    {
                        "count": 8,
                        "key": "2023-04-01T00:00:00.000Z"
                    }
                ]
            },
            {
                "count": 26,
                "key": "google",
                "data": [
                    {
                        "count": 2,
                        "key": "2022-05-01T00:00:00.000Z"
                    },
                    {
                        "count": 2,
                        "key": "2022-06-01T00:00:00.000Z"
                    },
                    {
                        "count": 4,
                        "key": "2022-07-01T00:00:00.000Z"
                    },
                    {
                        "count": 2,
                        "key": "2022-08-01T00:00:00.000Z"
                    },
                    {
                        "count": 0,
                        "key": "2022-09-01T00:00:00.000Z"
                    },
                    {
                        "count": 4,
                        "key": "2022-10-01T00:00:00.000Z"
                    },
                    {
                        "count": 3,
                        "key": "2022-11-01T00:00:00.000Z"
                    },
                    {
                        "count": 2,
                        "key": "2022-12-01T00:00:00.000Z"
                    },
                    {
                        "count": 1,
                        "key": "2023-01-01T00:00:00.000Z"
                    },
                    {
                        "count": 4,
                        "key": "2023-02-01T00:00:00.000Z"
                    },
                    {
                        "count": 1,
                        "key": "2023-03-01T00:00:00.000Z"
                    },
                    {
                        "count": 1,
                        "key": "2023-04-01T00:00:00.000Z"
                    }
                ]
            },
            {
                "count": 1,
                "key": "saml_dev-aman",
                "data": [
                    {
                        "count": 1,
                        "key": "2022-07-01T00:00:00.000Z"
                    }
                ]
            },
            {
                "count": 1,
                "key": "saml_dev-neha100",
                "data": [
                    {
                        "count": 1,
                        "key": "2022-11-01T00:00:00.000Z"
                    }
                ]
            },
            {
                "count": 1,
                "key": "saml_dev-neha100e",
                "data": [
                    {
                        "count": 1,
                        "key": "2022-12-01T00:00:00.000Z"
                    }
                ]
            }
        ]
    }
}
  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = (event) => {
    const results = ["data1","data2"];
    if(event.keyCode)
    {
        if(event.keyCode == 13){
          setSearchResults(results);
          setSearchTitle(event.currentTarget.value);
          return true;
        }
        else {
          return false;
       }
    
    }else{
      setSearchResults(results);
      return true;
    }    
  };

  return (
    <div id="page-container">
      {!searchResults.length && <div id="content-wrap">
        <div className="logo">
          <a href="/">
            <img src={Logo} />
          </a>
        </div>
        <div className="heading">
          <h1>Your Intelligent Virtual Assistant</h1>
          <p>
            The ultimate intelligent virtual assistant for automating tasks,
            improving productivity and enhancing customer experience.
          </p>
        </div>
      </div>}
      {!!searchResults.length &&<div id="content-wrap">
        <div className="heading">
        <h1>{searchTitle}</h1>
          <p>
              {searchResults && searchResults.map((result, index) => (
                <p key={index}>{result}</p>
              ))}
          </p>
        </div>
      </div>

      }
      <div id="search_section">
        <div className="search">
          <input
            type="text"
            className="searchTerm"
            placeholder="Hint: how many user registered in last 10 days?"
            onKeyDown={(e)=>handleSearch(e)}
          />
          <button type="submit" className="searchButton" onClick={handleSearch} >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 2L11 13"
                stroke="#2C4BFF"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="#2C4BFF"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        {/* <div className="search_results">
          <p>
            {searchResults.length > 0}
            <ul className="results-list">
              {searchResults.map((result, index) => (
                <li key={index}>{result}</li>
              ))}
            </ul>
          </p>
        </div> */}
      </div>
    </div>
  );
}

export default App;
