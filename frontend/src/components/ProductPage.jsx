import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faShareFromSquare, faCartShopping, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';

const ProductPage = () => {
  const { productID } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/product/${productID}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product details', error);
      }
    };
    fetchProduct();
  }, [productID]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product-page">
      <div className="header">
        <FontAwesomeIcon icon={faChevronLeft} className="back-icon" onClick={() => navigate(-1)} />
        <div className="header-icons">
          <FontAwesomeIcon icon={faShareFromSquare} className="share-icon" />
          <FontAwesomeIcon icon={faCartShopping} className="cart-icon" />
          <FontAwesomeIcon icon={faEllipsisVertical} className="more-icon" />
        </div>
      </div>
      
      <div className="productpage-image">
        <img src="{product.image}" alt={product.name} />
        <span className="image-counter">1/2</span>
      </div>
      
      <div className="product-details">
        <div className="price-range">{product.actual_price} - {product.discount_price}</div>
        <div className="coupon">
          <span className="coupon-tag">Coupon</span>
          Extra 15% off orders $40+
          <span className="coupon-arrow">&gt;</span>
        </div>
        <div className="holiday-deal">
          {product.name}
        </div>
        <div className="rating">
          <span className="stars">★★★★★</span>
          <span className="rating-number">4.8/5 (1.2k)</span>
          <span className="sales">11.6K sold</span>
        </div>
      </div>
      
      <div className="options">
        <div className="select-options">
          <span>Select options</span>
          <span className="options-label">Size, Flavor</span>
          <span className="options-arrow">&gt;</span>
        </div>
        <div className="size-options">
          <button>Small - 2oz</button>
          <button>Large - 6oz</button>
          <button>X-Large Party Bag - 1 lb</button>
        </div>
      </div>

      <div className="scrollable-content">
        <div className="product-description">
          <h3>Product Description</h3>
          <p>Indulge in the delightful crunch of our Freeze Dried Fruity Crunchies! These vibrant, flavorful treats are made from real fruit, freeze-dried to perfection to preserve their natural taste and nutrients.</p>
          <ul>
            <li>100% natural ingredients</li>
            <li>No added sugars or preservatives</li>
            <li>Gluten-free and vegan-friendly</li>
            <li>Perfect for snacking, baking, or adding to cereals and yogurt</li>
          </ul>
          <p>Available in a variety of sizes to suit your snacking needs. Try our Freeze Dried Skittles for an extra burst of rainbow flavor!</p>
        </div>
      </div>
      
      <div className="action-buttons">
        <button className="shop-button">Shop</button>
        <button className="chat-button">Chat</button>
        <button className="add-to-cart">Add to cart</button>
        <button className="buy-now">Buy now</button>
      </div>
    </div>
  );
};

export default ProductPage;