import React, { useState } from "react";
import "./index.css";
import { Chart as ChartJS, registerables } from "chart.js";
import { Bar } from "react-chartjs-2";
import Logo from "./logo.svg";
import loading from "./loading.svg";
import arrowDown from "./arrow--down.svg";
ChartJS.register(...registerables);

function App() {
  const [searchResults, setSearchResults] = useState({
    statsData: null,
    chartData: null,
  });
  const [searchTitle, setSearchTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (message) => {
    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.replace("realtime", "").replace("real time", ""),
          realtime:
            message.includes("real time") || message.includes("realtime")
              ? true
              : false,
        }),
      };
      const response = await fetch(
        process.env.REACT_APP_BACKEND_API_URL,
        requestOptions
      );
      const jsonData = await response.json();
      setData(jsonData);
      setIsLoading(false);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const randomRgbColor = () => {
    let r = Math.floor(Math.random() * 256); // Random between 0-255
    let g = Math.floor(Math.random() * 256); // Random between 0-255
    let b = Math.floor(Math.random() * 256); // Random between 0-255
    return "rgb(" + r + "," + g + "," + b + ")";
  };

  const setData = (results) => {
    if (results.chartData && Object.keys(results.chartData).length) {
      if (Array.isArray(results.chartData[Object.keys(results.chartData)[0]])) {
        let chartData = [];
        Object.keys(results.chartData).forEach((e, i) => {
          let tempChartData = { labels: [], datasets: [] };
          let datasetsData = [];
          results.chartData[e].forEach((item) => {
            tempChartData.labels.push(item.key);
            datasetsData.push(item.count);
          });
          tempChartData.datasets = [
            {
              data: datasetsData,
              backgroundColor: randomRgbColor(),
              label: Object.keys(results.chartData)[i],
              borderWidth: 2,
            },
          ];
          chartData.push(tempChartData);
        });
        setSearchResults({ chartData: chartData });
      } else {
        let tempStateData = searchResults;
        tempStateData.chartData = null;
        tempStateData.statsData = Math.round(
          results.chartData[Object.keys(results.chartData)[0]]
        );
        setSearchResults(tempStateData);
      }
      return true;
    } else if (results.statsData) {
      let tempStateData = searchResults;
      tempStateData.statsData = results.statsData.total;
      tempStateData.chartData = null;
      setSearchResults(tempStateData);
      return true;
    }
  };
  const handleSearch = (event) => {
    if (
      event.currentTarget.tagName === "BUTTON" ||
      (event.keyCode && event.keyCode == 13)
    ) {
      if(document.getElementById("inputbox").value.trim())
      {
        setSearchResults({ statsData: null, chartData: null });
        setIsLoading(true);
        setSearchTitle(document.getElementById("inputbox").value);
        fetchData(document.getElementById("inputbox").value);
      }
    }
  };
  return (
    <div id="page-container">
      {isLoading && (
        <div id="content-wrap">
          <div className="logo">
            <img src={loading} width={56} />
          </div>
        </div>
      )}
      {!isLoading &&
        searchResults.statsData == null &&
        searchResults.chartData == null && (
          <div>
            <header>
              <div className="logo">
                <a href="/">
                  <img src={Logo} />
                </a>
              </div>
            </header>
            <div id="landing-wrap">
              <div className="heading">
                <h1>
                  Ask questions in <span>plain English</span> and get meaningful
                  insights from your data
                </h1>
                <p>
                  You can simply type in your question, and the tool will
                  generate the necessary code and run the query for you.
                </p>
                <div className="arrow_down">
                  <img src={arrowDown} />
                </div>
              </div>
            </div>
          </div>
        )}
      {!isLoading &&
        (searchResults.statsData != null ||
          searchResults.chartData != null) && (
          <div id="search_results">
            <header>
              <h2>{searchTitle}</h2>
            </header>
            <div>
              {searchResults.statsData && <p>{searchResults.statsData}</p>}
              {searchResults.chartData &&
                searchResults.chartData.map((e, i) => (
                  <Bar data={e} key={i + Math.random()} />
                ))}
              <p></p>
            </div>
          </div>
        )}

      <div id="search_section">
        <div className="search">
          <input
            type="text"
            id="inputbox"
            className="searchTerm"
            placeholder="Hint: how many user registered in last 10 days?"
            onKeyDown={(e) => handleSearch(e)}
          />
          <button
            type="submit"
            className="searchButton"
            onClick={handleSearch}
            id="search"
          >
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="#2C4BFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
