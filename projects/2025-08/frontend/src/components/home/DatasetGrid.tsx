import React from 'react';
import { Star, Download, Eye, Coins } from 'lucide-react';

const DatasetGrid = () => {
  const datasets = [
    {
      id: 1,
      title: "Large-Scale Conversational AI Dataset",
      category: "Natural Language Processing",
      price: "0.05 ETH",
      rating: 4.9,
      downloads: "12.3K",
      size: "2.1 GB",
      auditScore: 96,
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 2,
      title: "Medical Imaging Annotation Dataset",
      category: "Computer Vision",
      price: "0.12 ETH",
      rating: 4.8,
      downloads: "8.7K",
      size: "5.4 GB",
      auditScore: 94,
      image: "https://images.pexels.com/photos/7089402/pexels-photo-7089402.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 3,
      title: "Financial Time Series Prediction Data",
      category: "Machine Learning",
      price: "0.08 ETH",
      rating: 4.7,
      downloads: "15.2K",
      size: "1.8 GB",
      auditScore: 98,
      image: "https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 4,
      title: "Multimodal Recommendation System Data",
      category: "Recommendation Systems",
      price: "0.15 ETH",
      rating: 4.9,
      downloads: "6.1K",
      size: "3.7 GB",
      auditScore: 95,
      image: "https://images.pexels.com/photos/7887807/pexels-photo-7887807.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Featured AI Datasets</h2>
        <p className="text-xl text-gray-300">Expert-validated premium data resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {datasets.map((dataset) => (
          <div key={dataset.id} className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="relative">
              <img 
                src={dataset.image} 
                alt={dataset.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                Audit: {dataset.auditScore}
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-blue-400 text-sm font-medium mb-2">{dataset.category}</div>
              <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">{dataset.title}</h3>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm font-medium">{dataset.rating}</span>
                </div>
                <div className="text-gray-300 text-sm">{dataset.size}</div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1 text-gray-300 text-sm">
                  <Download className="w-4 h-4" />
                  <span>{dataset.downloads}</span>
                </div>
                <div className="flex items-center space-x-1 text-green-400 font-semibold">
                  <Coins className="w-4 h-4" />
                  <span>{dataset.price}</span>
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 group">
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DatasetGrid;