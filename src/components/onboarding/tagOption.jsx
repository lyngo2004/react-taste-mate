import React from "react";

const TagOption = ({ label, selected, onClick }) => {
  return (
    <button
      type="button"
      className={`tag-option ${selected ? "tag-option--selected" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default TagOption;
