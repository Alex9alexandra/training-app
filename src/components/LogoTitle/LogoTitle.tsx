import React from "react";
import Logo from "../../assets/Logo.jpeg";
import "./LogoTitle.css"
type LogoTitleProps={
    title?: string;
    width?: number;
    height?: number;
};

const LogoTitle: React.FC<LogoTitleProps> = ({ title="Deea, Personal Trainer", width = 90, height = 90 }) => {
  return (
    <div className="logo-title">
      <img src={Logo} alt="Logo" width={width} height={height} />
      <div className='logo-title-text'>{title}</div>
    </div>
  );
};

export default LogoTitle;