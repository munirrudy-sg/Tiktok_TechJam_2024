import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import VideoCard from './components/VideoCard';
import BottomNavbar from './components/BottomNavbar';
import TopNavbar from './components/TopNavbar';
import ShopFYPCard from './components/ShopFYPCard';
import SearchPage from './components/SearchPage';
import ProductPage from './components/ProductPage';

const FYPItems = [
  {
    url: require('./videos/video1.mp4'),
    profilePic: 'https://p16-sign-useast2a.tiktokcdn.com/tos-useast2a-avt-0068-giso/9d429ac49d6d18de6ebd2a3fb1f39269~c5_100x100.jpeg?x-expires=1688479200&x-signature=pjH5pwSS8Sg1dJqbB1GdCLXH6ew%3D',
    username: 'csjackie',
    description: 'Lol nvm #compsci #chatgpt #ai #openai #techtok',
    song: 'Original sound - Famed Flames',
    likes: 430,
    comments: 13,
    saves: 23,
    shares: 1,
    type: 'video',
  },
  {
    url: require('./videos/video2.mp4'),
    profilePic: 'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/eace3ee69abac57c39178451800db9d5~c5_100x100.jpeg?x-expires=1688479200&x-signature=wAkVmwL7lej15%2B16ypSWQOqTP8s%3D',
    username: 'dailydotdev',
    description: 'Every developer brain @francesco.ciulla #developerjokes #programming #programminghumor #programmingmemes',
    song: 'tarawarolin wants you to know this isnt my sound - Chaplain J Rob',
    likes: '13.4K',
    comments: 3121,
    saves: 254,
    shares: 420,
    type: 'video',
  },
  {
    url: require('./videos/video3.mp4'),
    profilePic: 'https://p77-sign-va.tiktokcdn.com/tos-maliva-avt-0068/4e6698b235eadcd5d989a665704daf68~c5_100x100.jpeg?x-expires=1688479200&x-signature=wkwHDKfNuIDqIVHNm29%2FRf40R3w%3D',
    username: 'wojciechtrefon',
    description: '#programming #softwareengineer #vscode #programmerhumor #programmingmemes',
    song: 'help so many people are using my sound - Ezra',
    likes: 5438,
    comments: 238,
    saves: 12,
    shares: 117,
    type: 'video',
  },
  {
    type: 'shop',
    products: [
      {
        name: "Gun Gray High-quality Copper Multifunctional Intelligent Digital",
        actual_price: "Rp89.000",
        image: "path_to_image_1.jpg",
      },
      {
        name: "Gun Gray High-quality Copper Multifunctional Intelligent Digital",
        actual_price: "Rp89.000",
        image: "path_to_image_2.jpg",
      },
      {
        name: "Gun Gray High-quality Copper Multifunctional Intelligent Digital",
        actual_price: "Rp89.000",
        image: "path_to_image_3.jpg",
      },
    ]
  },
  {
    url: require('./videos/video4.mp4'),
    profilePic: 'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/4bda52cf3ad31c728153859262c329db~c5_100x100.jpeg?x-expires=1688486400&x-signature=ssUbbCpZFJj6uj33D%2BgtcqxMvgQ%3D',
    username: 'faruktutkus',
    description: 'Wait for the end | Im RTX 4090 TI | #softwareengineer #softwareengineer #coding #codinglife #codingmemes ',
    song: 'orijinal ses - Computer Science',
    likes: 9689,
    comments: 230,
    saves: 1037,
    shares: 967,
    type: 'video',
  },
];

function App() {
  const [items, setItems] = useState([]);
  const videoRefs = useRef([]);

  useEffect(() => {
    setItems(FYPItems);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.8,
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const videoElement = entry.target;
          videoElement.play();
        } else {
          const videoElement = entry.target;
          videoElement.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    videoRefs.current.forEach((videoRef) => {
      if (videoRef) {
        observer.observe(videoRef);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [items]);

  const handleVideoRef = (index) => (ref) => {
    videoRefs.current[index] = ref;
  };

  return (
    <Router>
      <div className="app">
        <div className="container">
          <TopNavbar />
          <Routes>
            <Route path="/" element={
              items.map((item, index) => (
                item.type === 'video' ? (
                  <VideoCard
                    key={index}
                    username={item.username}
                    description={item.description}
                    song={item.song}
                    likes={item.likes}
                    saves={item.saves}
                    comments={item.comments}
                    shares={item.shares}
                    url={item.url}
                    profilePic={item.profilePic}
                    setVideoRef={handleVideoRef(index)}
                    autoplay={index === 0}
                  />
                ) : (
                  <ShopFYPCard key={index} products={item.products} />
                )
              ))
            } />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:productID" element={<ProductPage />} />
          </Routes>
          <BottomNavbar />
        </div>
      </div>
    </Router>
  );
}

export default App;