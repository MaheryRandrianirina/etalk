import { MouseEventHandler } from "react";

export default function BackIcon({onClickBack}: {
    onClickBack: MouseEventHandler<SVGElement>
}) {
    return <svg
    onClick={onClickBack}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="go_back_button"
  >
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
}