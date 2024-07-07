import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchPage.css';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/search', { query: searchQuery });
      setResults(response.data.products);
    } catch (error) {
      console.error('Error fetching search results', error);
    }
  };

  const handleProductClick = async (productID) => {
    try {
      await axios.post('http://127.0.0.1:5000/click', { productID });
    } catch (error) {
      console.error('Error logging product click', error);
    }
    navigate(`/product/${productID}`);
  };

  return (
    <div className="search-page">
      <div className="search-bar">
        <button className="back-button" onClick={() => navigate(-1)}>{"<"}</button>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>
      <div className="results-container">
        <div className="results">
          {results.length > 0 ? (
            results.map((product) => (
              <div
                key={product.productID}
                className="product-card"
                onClick={() => handleProductClick(product.productID)}
              >
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.actual_price}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No results found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
