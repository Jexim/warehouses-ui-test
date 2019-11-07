import React from "react";
import "./loader.scss";

export default function Loader({ full }) {
  return (
    <div className="loader-container" style={full && { position: "absolute" }}>
      <div className="lds-hourglass"></div>
    </div>
  );
}
