import React from "react";
import {
  Stack,
  IStackStyles,
  IStackTokens,
  IStackItemStyles,
} from "office-ui-fabric-react/lib/Stack";
import {
  Nav,
  INavLink,
  INavStyles,
  INavLinkGroup,
} from "office-ui-fabric-react/lib/Nav";
import { Separator } from "office-ui-fabric-react/lib/Separator";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";

import AppCommandBar from "./AppCommandBar";
import AppSideBar from "./AppSideBar";

import "./App.css";
import { render } from "@testing-library/react";

initializeIcons();

class VerticalSeparator extends React.Component {
  constructor(props) {
    super(props);

    this.forwardEvent = this.forwardEvent.bind(this);
  }

  render() {
    let p = this.props;
    return (
      <div
        onClick={(e)=>this.forwardEvent(p.onClick, e)}
        onMouseDown={(e)=>this.forwardEvent(p.onMouseDown, e)}
        onMouseUp={(e)=>this.forwardEvent(p.onMouseUp, e)}
        onMouseMove={(e)=>this.forwardEvent(p.onMouseMove, e)}
      >
        <Separator
          vertical
          styles={{
            root: { cursor: "e-resize", display: "block", height: "100%" },
          }}
        />
      </div>
    );
  }

  forwardEvent(eh, e) {
    if (eh !== undefined) 
      eh(e);
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {sidebarWidth: 300};
    this.sepResize = false;

    this.onSepMouseDown = this.onSepMouseDown.bind(this);
    this.onSepMouseUp = this.onSepMouseUp.bind(this);
    this.onSepMouseMove = this.onSepMouseMove.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousemove", this.onSepMouseMove);
    document.addEventListener("mouseup", this.onSepMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.onSepMouseMove);
    document.removeEventListener("mouseup", this.onSepMouseUp);
  }

  render() {
    return (
      <div class="app-root">
        <AppCommandBar />
        <div class="app-content">
          <AppSideBar width={this.state.sidebarWidth} />
          <VerticalSeparator onMouseDown={this.onSepMouseDown} />
          <div id="gmap"></div>
        </div>
      </div>
    );
  }

  onSepMouseDown(e) {
    this.sepResize = true;
    this.sepSizeRef = this.state.sidebarWidth;
    this.sepSizeSrcX = e.screenX;
  }

  onSepMouseUp(e) {
    this.sepResize = false;
  }

  onSepMouseMove(e) {
    if(this.sepResize) {
      this.setState({sidebarWidth: this.sepSizeRef + e.screenX - this.sepSizeSrcX});
    }
  }
}

export default App;
