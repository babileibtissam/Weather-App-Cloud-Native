import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import './FavouriteIcon.css';

const FavouriteIcon = ({ city, onFavouriteToggle }) => {
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    if (!city) return;
    
    const favourites = JSON.parse(localStorage.getItem('favouriteCities') || '[]');
    setIsFavourite(favourites.some(fav => fav.name === city.name));
  }, [city]);

  const toggleFavourite = () => {
    if (!city || !city.name) {
      console.error("Erreur: Données de ville invalides");
      return;
    }

    const favourites = JSON.parse(localStorage.getItem('favouriteCities') || '[]');
    
    if (isFavourite) {
      const updatedFavourites = favourites.filter(fav => fav.name !== city.name);
      localStorage.setItem('favouriteCities', JSON.stringify(updatedFavourites));
    } else {
      const updatedFavourites = [...favourites, {
        name: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
        timestamp: new Date().toISOString()
      }];
      localStorage.setItem('favouriteCities', JSON.stringify(updatedFavourites));
    }
    
    setIsFavourite(!isFavourite);
    if (onFavouriteToggle) {
      onFavouriteToggle(!isFavourite, city);
    }
  };

  // Ne pas rendre l'icône si city est undefined
  if (!city) {
    return null;
  }

  return (
    <button 
      className={`favourite-icon ${isFavourite ? 'active' : ''}`}
      onClick={toggleFavourite}
      aria-label={isFavourite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {isFavourite ? <FaHeart color="#ff4757" /> : <FaRegHeart />}
    </button>
  );
};

export default FavouriteIcon;