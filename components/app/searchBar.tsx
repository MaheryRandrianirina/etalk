import { ChangeEventHandler } from "react";
import { InputSearch } from "../form/input";

export default function SearchBar({onSearchBarChange, value}: {
  onSearchBarChange: ChangeEventHandler<HTMLInputElement>,
  value: string
}): JSX.Element {
    return (
      <div className="search_bar_container">
        <div className="search_bar">
          <InputSearch
            attributes={{
              className: "search_input",
              name: "q",
              placeholder: "taper quelque chose...",
              value: value
            }}
            events={{onChange: onSearchBarChange}}
          />
          <div className="search_button">
              <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="magnifying_glass"
              >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
          </div>
        </div>
      </div>
    );
}