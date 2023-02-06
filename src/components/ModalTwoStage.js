import React from "react";

class ModalTwoStage extends React.Component {
  constructor(props) {
    super(props);
    this.title                  = props.title                  || "Untitled Modal";
    this.body                   = props.body                   || "No body.";
    this.primaryButtonText      = props.primaryButtonText      || "Primary Button";
    this.primaryButtonOnClick   = props.primaryButtonOnClick   || function() {alert("No action assigned");};
    this.secondaryButtonText    = props.secondaryButtonText    || "Secondary Button";
    this.secondaryButtonOnClick = props.secondaryButtonOnClick || function() {alert("No action assigned");};
    this.isConnecting           = props.isConnecting           || false;
    this.hidden                 = props.hidden                 || false;
    this.stage                  = props.stage                  || false; 
    this.updateStage            = props.updateStage            || function() {alert("No action assigned");};
  }

  render() {
    return (
      <div className={`Modal-background ${this.props.hidden ? "Modal-hidden" : ""}`} key={this.props.hidden}>
        <div className="Modal-title">{this.title}</div>
        <div className="Modal-body">{this.props.body}</div>
  
        <div className={`Modal-button-container ${this.props.stage ? "App-hidden" : ""}`}>
          <div className="Modal-button Modal-button-generic" onClick={() => {this.updateStage("PPG")}}                             >PPG</div>
          <div className="Modal-button Modal-button-generic" onClick={() => {this.updateStage("GYR")}} style={{marginRight: "0px"}}>GYR</div>
          <div className="Modal-button Modal-button-generic" onClick={() => {this.updateStage("ACC")}} style={{marginRight: "0px"}}>ACC</div>
          <div className="Modal-button Modal-button-generic" onClick={() => {this.updateStage("EEG")}} style={{marginRight: "0px"}}>EEG</div>
        </div>

        <div className={`Modal-button-container ${this.props.stage ? "" : "App-hidden"}`}>
          <div className={`Modal-button Modal-button-primary ${this.props.isConnecting ? "" : "Modal-button-primary-hover-allowed"}`} onClick={this.primaryButtonOnClick}>
            <div className={`${this.props.isConnecting ? "App-hidden" : ""}`}>{this.primaryButtonText}</div>
            <div className={`${this.props.isConnecting ? "" : "App-hidden"} App-connecting-circle`}></div>
          </div>
          <div className="Modal-button Modal-button-secondary" onClick={this.secondaryButtonOnClick}>{this.secondaryButtonText}</div>
        </div>

      </div>
    );
  }
}

export default ModalTwoStage;
