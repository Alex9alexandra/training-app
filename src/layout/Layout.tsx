import React from "react"
import {Outlet} from "react-router-dom";
import "./Layout.css"
import LogoTitle from "../components/LogoTitle/LogoTitle";
import { GlassContainer } from "../components/GlassContainer/GlassContainer";
import ActivitySummary from "../components/ActivitySummary/ActivitySummary";

const Layout : React.FC=()=>{
    return(
        <main className="app-background">
            <div className="center-wrapper">
                <div className="logo-title-comp">
                    <LogoTitle/>
                </div>
                
                <div className="glass-structure">
                    <GlassContainer>
                        <div style={{display:'block',width:'100%'}}><Outlet/></div>
                    </GlassContainer>
                </div>

                <div className="summary">
                    <ActivitySummary/>
                </div>
            </div>
        </main>

    );
};

export default Layout;