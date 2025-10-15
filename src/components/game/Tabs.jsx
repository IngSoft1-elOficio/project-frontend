import React, { useState } from 'react'

export default function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(0); 

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <div className=''>
    <div className="flex pb-2">
        {React.Children.map(children, (child, index) => (
        <button
            key={index}
            className={`px-4 py-2 rounded-t-lg font-semibold transition-all ${
            index === activeTab 
                ? 'text-white shadow-lg border-b border-[#B49150]' 
                : 'text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => handleTabClick(index)}
        >
            {child.props.label}
        </button>
        ))}
    </div>
    <div className="p-6 text-white">
        {React.Children.toArray(children)[activeTab]}
    </div>
    </div>
  );
};
