import React from 'react'
import { assets } from '../assets/assets'

// Simple read-only star rating display
// Props:
//  rating: number (0-5) - how many stars to fill
const StarRating = ({ rating = 4 }) => {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = rating > index
        return (
          <img
            key={index}
            src={filled ? assets.starIconFilled : assets.starIconOutlined}
            alt={filled ? 'filled star' : 'empty star'}
            className="w-4.5 h-4.5"
            loading="lazy"
          />
        )
      })}
    </div>
  )
}

export default StarRating