import React, { useEffect, useState } from 'react';
import './ShopFYPCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShopFYPCard = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const userID = "1"; // The userID to be used for fetching recommendations

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/recommend/${userID}`);
        if (response.data && response.data.products) {
          setProducts(response.data.products.slice(0, 3)); // Get the top 3 products
        } else {
          console.error('No products found in the response:', response.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleBuyClick = (productID) => {
    navigate(`/product/${productID}`);
  };

  return (
    <div className="shop-fyp-card">
      <div className="inner-card">
        <div className="offer-header">
          <h3>No Threshold Cut 25k</h3>
          <p>New Customer Offer</p>
        </div>
        <div className="product-list">
          {products.length > 0 ? (
            products.map((product, index) => (
              <div className="product-item" key={index}>
                <img src='/images/sample_img.PNG' alt={product.name} className="product-image" />
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-price" style={{ textDecoration: 'line-through' }}>{product.actual_price}</p>
                  <p className="product-price">{product.discount_price}</p>
                </div>
                <button className="buy-button" onClick={() => handleBuyClick(product.productID)}>Buy</button>
              </div>
            ))
          ) : (
            <p>No recommended products available.</p>
          )}
        </div>
      </div>
      <div className="actions">
        <button className="not-interested">Not interested</button>
        <button className="see-more">See more</button>
      </div>
      <div className="swipe-up">
        <FontAwesomeIcon icon={faChevronUp} className="chevron-icon" />
        <span>swipe up to skip</span>
      </div>
    </div>
  );
};

export default ShopFYPCard;
