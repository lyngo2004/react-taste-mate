import React from "react";

const TagOption = ({ label, selected, disabled = false, onClick }) => {
  return (
    <button
      type="button"
      className={`tag-option 
        ${selected ? "tag-option--selected" : ""} 
        ${disabled ? "tag-option--disabled" : ""}
      `}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {label}
    </button>
  );
};

export default TagOption;
