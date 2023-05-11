import React, { useState } from 'react';
import './index.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    const results = [
      'Result 1',
      'Result 2',
      'Result 3',
      'Result 4',
      'Result 5',
    ];

    setSearchResults(results);
  };

  return (
  <div class="wrap">
   <div class="search">
      <input type="text" class="searchTerm" placeholder="Hint: how many user registered in last 10 days?" />
      <button type="submit" class="searchButton" onClick={handleSearch}>
        <i class="fa fa-search">Go</i>
     </button>
   </div>
   <div class="search">
    <p>
	 {searchResults.length > 0 ? (
            <ul className="results-list">
              {searchResults.map((result, index) => (
                <li key={index}>{result}</li>
              ))}
            </ul>
          ) : (
            <p className="no-results">No results found.</p>
          )}
	 </p>
   </div>
</div>    
  );
}

export default App;