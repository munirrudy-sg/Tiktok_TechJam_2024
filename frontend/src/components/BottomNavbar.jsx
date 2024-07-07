import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faShoppingCart, faPlus, faInbox, fa7,faUser } from '@fortawesome/free-solid-svg-icons';

function BottomNavbar() {
  return (
      <div className="bottom-navbar">
        <div className="nav-item">
          <FontAwesomeIcon icon={faHouse} className="icon active" />
          <span className="item-name active">Home</span>
        </div>
        <div className="nav-item">
          <FontAwesomeIcon icon={faShoppingCart} className="icon" />
          <span className="item-name">Shop</span>
        </div>
        <div className="nav-item">
          <FontAwesomeIcon icon={faPlus} className="icon plus" />
          <span className="item-name">Create</span>
        </div>
        <div className="nav-item">
          <FontAwesomeIcon icon={fa7} className="notification" />
          <FontAwesomeIcon icon={faInbox} className="icon" />
          <span className="item-name">Inbox</span>
        </div>
        <div className="nav-item">
          <FontAwesomeIcon icon={faUser} className="icon" />
          <span className="item-name">Profile</span>
        </div>
      </div>
  );
}

export default BottomNavbar;
