import React from "react";
import "./Button.css";

type ButtonProps = {
  text: string;
  onClick?: () => void;
  variant?: "primary" ;
};

const Button: React.FC<ButtonProps> = ({ text, onClick, variant = "primary" }) => {
  return (
    <button className={`btn ${variant}`} onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;