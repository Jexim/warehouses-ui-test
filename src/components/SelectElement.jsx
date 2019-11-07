import React from "react";
import AsyncSelect from "react-select-async-paginate";

export default function SelectElement(props) {
  return (
    <div style={{ position: "relative" }}>
      <AsyncSelect {...props} />
      {!!props.disabled && <div style={{ backgroundColor: "rgba(0,0,0,0.05)", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, borderRadius: 3 }}></div>}
    </div>
  );
}
