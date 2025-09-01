import React, { useState } from 'react';
import { Shield, Clock, Star, CheckCircle, ArrowRight, Upload, FileText } from 'lucide-react';

const AuditServicesPage = () => {
  const [selectedService, setSelectedService] = useState<string>('standard');

  const services = [
    {
      id: 'standard',
      name: 'Standard Audit',
      price: '0.05 ETH',
      duration: '3-5 days',
      experts: '3 experts',
      features: [
        'Data quality assessment',
        'Annotation accuracy verification',
        'Data integrity validation',
        'Basic compliance review'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Audit',
      price: '0.12 ETH',
      duration: '5-7 days',
      experts: '5 experts',
      features: [
        'Comprehensive data quality analysis',
        'Algorithmic bias detection',
        'Privacy compliance review',
        'Data source verification',
        'Performance benchmarking'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Custom',
      price: 'Custom',
      duration: '7-14 days',
      experts: 'Expert team',
      features: [
        'Custom audit standards',
        'Domain-specific experts',
        'Detailed audit reports',
        'Continuous monitoring',
        'Compliance certification'
      ]
    }
  ];

  const auditProcess = [
    { step: 'Submit Dataset', desc: 'Upload data and select audit service' },
    { step: 'Expert Assignment', desc: 'System matches suitable experts' },
    { step: 'Independent Review', desc: 'Multiple experts conduct parallel audits' },
    { step: 'Consensus Formation', desc: 'Reputation-weighted consensus reached' },
    { step: 'Report Generation', desc: 'Detailed audit report generated' }
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">AI Dataset Audit Services</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Professional decentralized audit services ensuring quality and compliance of your AI datasets
          </p>
        </div>

        {/* Service Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {services.map((service) => (
            <div 
              key={service.id}
              className={`bg-white/5 backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                selectedService === service.id 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-white/10 hover:border-white/30'
              }`}
              onClick={() => setSelectedService(service.id)}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{service.name}</h3>
                <div className="text-3xl font-bold text-blue-400 mb-1">{service.price}</div>
                <div className="text-gray-300 text-sm">{service.duration} • {service.experts}</div>
              </div>

              <ul className="space-y-3 mb-6">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-3 rounded-lg transition-all duration-200 ${
                  selectedService === service.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>

        {/* Upload Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Submit Audit Request</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Dataset Name</label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                  placeholder="Enter dataset name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Data Type</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none">
                  <option value="">Select data type</option>
                  <option value="text">Text Data</option>
                  <option value="image">Image Data</option>
                  <option value="audio">Audio Data</option>
                  <option value="video">Video Data</option>
                  <option value="tabular">Structured Data</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Use Case</label>
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none h-24 resize-none"
                  placeholder="Describe the intended use and application scenarios"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Upload Dataset</label>
                <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors duration-200 cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Click to upload or drag files here</p>
                  <p className="text-gray-500 text-sm">Supports .zip, .tar.gz formats, max 5GB</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Special Requirements</label>
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none h-20 resize-none"
                  placeholder="Specify any special audit requirements"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 group">
              <Shield className="w-5 h-5" />
              <span className="text-lg font-semibold">Submit Audit Request</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Audit Process */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Audit Process</h2>
          
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 md:space-x-4">
            {auditProcess.map((process, index) => (
              <div key={index} className="flex flex-col items-center text-center max-w-xs">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{process.step}</h3>
                <p className="text-gray-300 text-sm">{process.desc}</p>
                
                {index < auditProcess.length - 1 && (
                  <div className="hidden md:block mt-4">
                    <ArrowRight className="w-6 h-6 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditServicesPage;