import  { type ReactNode } from "react";
import "./GlassContainer.css";

type GlassContainerProps = {
  children: ReactNode;
};

export const GlassContainer = ({ children }: GlassContainerProps) => {
  return <div className="glass-container">{children}</div>;
};