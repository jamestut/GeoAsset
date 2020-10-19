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
  constructor(props) {
    super(props);
    this.state = { value: this.props.value };
    this.clearValue = this.clearValue.bind(this);
  }

  render() {
    return (
      <Stack horizontal verticalAlign="end">
        <DatePicker
          label={this.props.label}
          value={this.state.value}
          onSelectDate={this.props.onSelectDate}
        />
        <IconButton
          iconProps={{ iconName: "Clear" }}
          onClick={this.clearValue}
        />
      </Stack>
    );
  }

  clearValue() {
    this.setState({ value: null });
    if (this.props.onSelectDate) this.props.onSelectDate(null);
  }
}

export class CommonEditDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hidden: true };

    this.objCopy = {};

    this.onSaveDiscard = this.onSaveDiscard.bind(this);
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
        onDismiss={(e) => this.onSaveDiscard(false)}
        dialogContentProps={commonEditDialogContentProps}
        modalProps={{ isBlocking: true }}
      >
        <Stack>
          <TextField
            label="Name"
            defaultValue={this.props.data.name}
            required
            onChange={(el, v) => (this.objCopy.name = v)}
          />
          <CustomDateEditor
            label="Purchase Date"
            value={this.props.data.purchaseDate}
            onSelectDate={(date) => (this.objCopy.purchaseDate = date)}
          />
          <CustomDateEditor
            label="Renewal Date"
            value={this.props.data.renewalDate}
            onSelectDate={(date) => (this.objCopy.renewalDate = date)}
          />
          <CustomDateEditor
            label="Sold On"
            value={this.props.data.sellDate}
            onSelectDate={(date) => (this.objCopy.sellDate = date)}
          />
          <TextField
            label="Remark"
            multiline
            rows={2}
            onChange={(el, v) => (this.objCopy.remark = v)}
            defaultValue={this.props.data.remark}
          />
        </Stack>
        <DialogFooter>
          <PrimaryButton
            onClick={(e) => this.onSaveDiscard(true)}
            text="Save"
          />
          <DefaultButton
            onClick={(e) => this.onSaveDiscard(false)}
            text="Cancel"
          />
        </DialogFooter>
      </Dialog>
    );
  }

  onSaveDiscard(isSave) {
    let param = isSave ? this.objCopy : null;
    let handler = isSave ? this.props.onSave : this.props.onDismiss;
    if (handler) handler(param);
  }
}
