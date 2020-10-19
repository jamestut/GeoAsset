import React from "react";
import { Separator } from "office-ui-fabric-react/lib/Separator";

export class VerticalSeparator extends React.Component {
  constructor(props) {
    super(props);

    this.forwardEvent = this.forwardEvent.bind(this);
  }

  render() {
    let p = this.props;
    return (
      <div
        onClick={(e) => this.forwardEvent(p.onClick, e)}
        onMouseDown={(e) => this.forwardEvent(p.onMouseDown, e)}
        onMouseUp={(e) => this.forwardEvent(p.onMouseUp, e)}
        onMouseMove={(e) => this.forwardEvent(p.onMouseMove, e)}
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
    if (eh !== undefined) eh(e);
  }
}