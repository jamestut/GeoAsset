import React from "react";

import {
  Dialog,
  DialogType,
  DialogFooter,
} from "office-ui-fabric-react/lib/Dialog";
import {
  PrimaryButton,
  DefaultButton,
} from "office-ui-fabric-react/lib/Button";

const discardDialogContentProps = {
  type: DialogType.normal,
  title: "Discard Unsaved Changes",
  closeButtonAriaLabel: "Close",
  subText: "Discard unsaved changes and proceed?",
};

export class DiscardDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hidden: true };

    this.forwardEvent = this.forwardEvent.bind(this);
  }

  render() {
    return (
      <Dialog
        hidden={this.props.hidden}
        onDismiss={(e)=>this.forwardEvent(this.props.onDismiss)}
        dialogContentProps={discardDialogContentProps}
        modalProps={{isBlocking:true}}
      >
        <DialogFooter>
          <PrimaryButton onClick={(e)=>this.forwardEvent(this.props.onSave)} text="Save" />
          <DefaultButton onClick={(e)=>this.forwardEvent(this.props.onDiscard)} text="Discard" />
          <DefaultButton onClick={(e)=>this.forwardEvent(this.props.onDismiss)} text="Cancel" />
        </DialogFooter>
      </Dialog>
    );
  }

  forwardEvent(handler) {
    if(handler)
      handler();
  }
}
