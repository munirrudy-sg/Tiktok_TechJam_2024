import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const TopNavbar = () => {
  const navigate = useNavigate();

  const handleSearchIconClick = () => {
    navigate('/search');
  };

  return (
    <div className="top-navbar">
      <h2>Following | <span>For You</span></h2>
      <FontAwesomeIcon icon={faSearch} className='icon' onClick={handleSearchIconClick} />
    </div>
  );
};

export default TopNavbar;