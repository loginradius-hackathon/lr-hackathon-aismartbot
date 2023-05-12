import React, { useState } from "react";
import "./index.css";
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2'
import Logo from "./logo.svg";
import loading from "./loading.gif";

ChartJS.register(...registerables);

function App() {
  const [searchResults, setSearchResults] = useState({ statsData: null, chartData: { labels: [], datasets: [] } });
  const [searchTitle, setSearchTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false);

    const fetchData = async (message) => {
      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
      };
         const response = await fetch(process.env.REACT_APP_BACKEND_API_URL,requestOptions);
         const jsonData = await response.json();
        setData(jsonData);
        setIsLoading(false);
      } catch (error) {
        console.log('Error:', error);
      }
    };



  const randomRgbColor = () => {
    let r = Math.floor(Math.random() * 256); // Random between 0-255
    let g = Math.floor(Math.random() * 256); // Random between 0-255
    let b = Math.floor(Math.random() * 256); // Random between 0-255
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  };

const setData = (results) =>{
  let datasetsData = []
      if (results.chartData && Object.keys(results.chartData).length) {
        let tempChartData = searchResults.chartData;
        Object.values(results.chartData)[0].forEach(e => {
          tempChartData.labels.push(e.key);
          datasetsData.push(e.count)
        })
        tempChartData.datasets = [{ "data": datasetsData, "backgroundColor": randomRgbColor(), "label": Object.keys(results.chartData)[0], "borderWidth": 2 }]
        setSearchResults({ chartData: tempChartData });
        return true;
      }
      if (results.statsData) {
        let tempStateData = searchResults;
        tempStateData.statsData = results.statsData.total
        setSearchResults(tempStateData);
        return true;
      }
}
  const handleSearch = (event) => {
    if (event.currentTarget.tagName === "BUTTON" || (event.keyCode && event.keyCode == 13)) {
      setSearchResults({ statsData: null, chartData: { labels: [], datasets: [] } })
      setIsLoading(true);
      setSearchTitle(document.getElementById("inputbox").value);
      fetchData(document.getElementById("inputbox").value);
    }
  }
  return (
    <div id="page-container">
      {isLoading &&
       <div id="content-wrap">
       <div className="logo">
         <img src={loading} />
       </div>
     </div>
      }
      {(!isLoading && !searchResults.statsData && !searchResults.chartData.labels.length) && <div id="content-wrap">
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
      {(!isLoading && (!!searchResults.statsData || !!searchResults.chartData.labels.length)) && <div id="content-wrap">
        <div className="heading">
          <h1>{searchTitle}</h1>
          {searchResults.statsData && <p>{searchResults.statsData}</p>}
          {!!searchResults.chartData.labels.length && <Bar
            data={searchResults.chartData}
          />}
          <p>
          </p>
        </div>
      </div>
      }

      <div id="search_section">
        <div className="search">
          <input
            type="text"
            id="inputbox"
            className="searchTerm"
            placeholder="Hint: how many user registered in last 10 days?"
            onKeyDown={(e) => handleSearch(e)}
          />
          <button type="submit" className="searchButton" onClick={handleSearch} id="search" >
            <svg
              id="search"
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
      </div>
    </div>
  );
}

export default App;
