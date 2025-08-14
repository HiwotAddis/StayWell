import React from 'react'
import Hero from '../components/Hero'
import FeaturedDestination from '../components/FeaturedDestination'
import ExclusiveOffers from '../components/ExclusiveOffers'
import Testimonial from '../components/Testimonial'

const Home = () => {
  return (
    <div>
        <Hero />
        <FeaturedDestination />
        <ExclusiveOffers/>
        <Testimonial/>
    </div>
  )
}

export default Home