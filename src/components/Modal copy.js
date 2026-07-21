import React from "react";

function Modal(args) {
  const title = args.title || "Untitled Modal";
  const body = args.body || "No body.";
  const primaryButtonText = args.primaryButtonText || "Primary Button";
  const primaryButtonOnClick = args.primaryButtonOnClick || function() {alert("No action assigned");};
  const secondaryButtonText = args.secondaryButtonText || "Secondary Button";
  const secondaryButtonOnClick = args.secondaryButtonOnClick || function() {alert("No action assigned");};
  const hidden = args.hidden || false;

  return (
    <div className="Modal-background">
      <div className="Modal-title">{title}</div>
      <div className="Modal-body">{body}</div>

      <div className="Modal-button-container">
        <div className="Modal-button Modal-button-primary" onClick={primaryButtonOnClick}>{primaryButtonText}</div>
        <div className="Modal-button Modal-button-secondary" onClick={secondaryButtonOnClick}>{secondaryButtonText}</div>
      </div>
    </div>
  );
}

export default Modal;
