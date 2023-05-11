import React, { useState } from "react";
import "./index.css";
import Logo from "./logo.svg";
function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    const results = [
      "Result 1",
      "Result 2",
      "Result 3",
      "Result 4",
      "Result 5",
    ];

    setSearchResults(results);
  };

  return (
    <div id="page-container">
      <div id="content-wrap">
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
      </div>
      <div id="search_section">
        <div class="search">
          <input
            type="text"
            class="searchTerm"
            placeholder="Hint: how many user registered in last 10 days?"
          />
          <button type="submit" class="searchButton" onClick={handleSearch}>
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
        <div class="search_results">
          <p>
            {searchResults.length > 0}
            <ul className="results-list">
              {searchResults.map((result, index) => (
                <li key={index}>{result}</li>
              ))}
            </ul>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
