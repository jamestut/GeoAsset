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
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { TextField } from "@fluentui/react";
import { DatePicker, IconButton } from "office-ui-fabric-react";

class CustomDateEditor extends React.Component {
  render() {
    return (
      <Stack horizontal verticalAlign="end">
        <DatePicker label={this.props.label} />
        <IconButton iconProps={{ iconName: "Clear" }} />
      </Stack>
    );
  }
}

export class CommonEditDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hidden: true };

    this.forwardEvent = this.forwardEvent.bind(this);
  }

  render() {
    const commonEditDialogContentProps = {
      type: DialogType.normal,
      title: this.props.title,
      closeButtonAriaLabel: "Close",
    };

    return (
      <Dialog
        hidden={this.props.hidden}
        onDismiss={(e) => this.forwardEvent(this.props.onDismiss)}
        dialogContentProps={commonEditDialogContentProps}
        modalProps={{ isBlocking: true }}
      >
        <Stack>
          <TextField label="Name" required />
          <CustomDateEditor label="Purchase Date" />
          <CustomDateEditor label="Renewal Date" />
          <CustomDateEditor label="Sold On" />
          <TextField label="Remark" multiline rows={2} />
        </Stack>
        <DialogFooter>
          <PrimaryButton
            onClick={(e) => this.forwardEvent(this.props.onSave)}
            text="Save"
          />
          <DefaultButton
            onClick={(e) => this.forwardEvent(this.props.onDiscard)}
            text="Cancel"
          />
        </DialogFooter>
      </Dialog>
    );
  }

  forwardEvent(handler) {
    if (handler) handler();
  }
}
