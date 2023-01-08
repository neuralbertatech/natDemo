import React from "react";

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.title                  = props.title                  || "Untitled Modal";
    this.body                   = props.body                   || "No body.";
    this.primaryButtonText      = props.primaryButtonText      || "Primary Button";
    this.primaryButtonOnClick   = props.primaryButtonOnClick   || function() {alert("No action assigned");};
    this.secondaryButtonText    = props.secondaryButtonText    || "Secondary Button";
    this.secondaryButtonOnClick = props.secondaryButtonOnClick || function() {alert("No action assigned");};
    this.hidden                 = props.hidden                 || false;
  }

  render() {
    return (
      <div className={`Modal-background ${this.props.hidden ? "Modal-hidden" : ""}`} key={this.props.hidden}>
        <div className="Modal-title">{this.title}</div>
        <div className="Modal-body">{this.body}</div>
  
        <div className="Modal-button-container">
          <div className="Modal-button Modal-button-primary" onClick={this.primaryButtonOnClick}>{this.primaryButtonText}</div>
          <div className="Modal-button Modal-button-secondary" onClick={this.secondaryButtonOnClick}>{this.secondaryButtonText}</div>
        </div>
      </div>
    );
  }
}

export default Modal;
