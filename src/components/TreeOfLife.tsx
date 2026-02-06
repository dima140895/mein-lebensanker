import React from 'react';

interface TreeOfLifeProps {
  className?: string;
}

const TreeOfLife: React.FC<TreeOfLifeProps> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tree trunk and roots */}
      <g opacity="0.15">
        {/* Main trunk */}
        <path
          d="M200 480 L200 280 Q200 260 195 245 Q190 230 200 220 Q210 230 205 245 Q200 260 200 280"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Left root system */}
        <path
          d="M200 480 Q180 470 160 475 Q140 480 120 470"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M200 480 Q175 475 155 485 Q135 495 110 490"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M200 480 Q185 478 175 490 Q165 502 145 505"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Right root system */}
        <path
          d="M200 480 Q220 470 240 475 Q260 480 280 470"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M200 480 Q225 475 245 485 Q265 495 290 490"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M200 480 Q215 478 225 490 Q235 502 255 505"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Main branches */}
        {/* Left main branch */}
        <path
          d="M200 260 Q180 240 150 230 Q120 220 100 190"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M150 230 Q140 210 120 200 Q100 190 90 160"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M100 190 Q80 175 70 150 Q60 125 50 110"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Right main branch */}
        <path
          d="M200 260 Q220 240 250 230 Q280 220 300 190"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M250 230 Q260 210 280 200 Q300 190 310 160"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M300 190 Q320 175 330 150 Q340 125 350 110"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Upper left branches */}
        <path
          d="M120 200 Q100 180 80 170 Q60 160 50 140"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M90 160 Q70 145 60 120 Q50 95 55 70"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M100 190 Q90 160 100 130 Q110 100 105 70"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Upper right branches */}
        <path
          d="M280 200 Q300 180 320 170 Q340 160 350 140"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M310 160 Q330 145 340 120 Q350 95 345 70"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M300 190 Q310 160 300 130 Q290 100 295 70"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Center top branches */}
        <path
          d="M200 220 Q200 180 180 150 Q160 120 160 80"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M200 220 Q200 180 220 150 Q240 120 240 80"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M200 220 Q200 170 200 140 Q200 110 200 60"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Small twigs */}
        <path
          d="M160 80 Q150 60 145 40"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M160 80 Q170 55 175 35"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M240 80 Q250 60 255 40"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M240 80 Q230 55 225 35"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M200 60 Q185 40 180 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M200 60 Q215 40 220 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
      
      {/* Leaves - scattered organic shapes */}
      <g opacity="0.12">
        {/* Top crown leaves */}
        <circle cx="200" cy="35" r="12" fill="currentColor" />
        <circle cx="175" cy="45" r="10" fill="currentColor" />
        <circle cx="225" cy="45" r="10" fill="currentColor" />
        <circle cx="155" cy="55" r="11" fill="currentColor" />
        <circle cx="245" cy="55" r="11" fill="currentColor" />
        <circle cx="145" cy="75" r="9" fill="currentColor" />
        <circle cx="255" cy="75" r="9" fill="currentColor" />
        
        {/* Mid-upper leaves */}
        <circle cx="120" cy="95" r="13" fill="currentColor" />
        <circle cx="280" cy="95" r="13" fill="currentColor" />
        <circle cx="90" cy="115" r="11" fill="currentColor" />
        <circle cx="310" cy="115" r="11" fill="currentColor" />
        <circle cx="65" cy="135" r="12" fill="currentColor" />
        <circle cx="335" cy="135" r="12" fill="currentColor" />
        
        {/* Side crown leaves */}
        <circle cx="55" cy="100" r="10" fill="currentColor" />
        <circle cx="345" cy="100" r="10" fill="currentColor" />
        <circle cx="45" cy="155" r="9" fill="currentColor" />
        <circle cx="355" cy="155" r="9" fill="currentColor" />
        <circle cx="75" cy="170" r="11" fill="currentColor" />
        <circle cx="325" cy="170" r="11" fill="currentColor" />
        
        {/* More scattered leaves */}
        <circle cx="100" cy="145" r="8" fill="currentColor" />
        <circle cx="300" cy="145" r="8" fill="currentColor" />
        <circle cx="130" cy="120" r="9" fill="currentColor" />
        <circle cx="270" cy="120" r="9" fill="currentColor" />
        <circle cx="165" cy="90" r="10" fill="currentColor" />
        <circle cx="235" cy="90" r="10" fill="currentColor" />
        <circle cx="200" cy="75" r="8" fill="currentColor" />
        
        {/* Additional foliage depth */}
        <circle cx="110" cy="175" r="7" fill="currentColor" />
        <circle cx="290" cy="175" r="7" fill="currentColor" />
        <circle cx="85" cy="145" r="6" fill="currentColor" />
        <circle cx="315" cy="145" r="6" fill="currentColor" />
        <circle cx="140" cy="100" r="7" fill="currentColor" />
        <circle cx="260" cy="100" r="7" fill="currentColor" />
      </g>
    </svg>
  );
};

export default TreeOfLife;
