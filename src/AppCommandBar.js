import * as React from "react";
import {
  CommandBar,
  ICommandBarItemProps,
} from "office-ui-fabric-react/lib/CommandBar";
import { IButtonProps } from "office-ui-fabric-react/lib/Button";

const overflowProps = { ariaLabel: "More commands" };



class AppCommandBar extends React.Component {
  constructor(props) {
    super(props);

    this.forwardEvent = this.forwardEvent.bind(this);
  }

  render() {
    const _items = [
      {
        key: "new",
        text: "New",
        cacheKey: "myCacheKey", // changing this key will invalidate this item's cache
        iconProps: { iconName: "OpenFile" },
        ariaLabel: "New",
        onClick: (e)=>this.forwardEvent("new")
      },
      {
        key: "open",
        text: "Open",
        iconProps: { iconName: "FabricOpenFolderHorizontal" },
        onClick: (e)=>this.forwardEvent("open")
      },
      {
        key: "save",
        text: "Save",
        iconProps: { iconName: "Save" },
        split: true,
        disabled: !this.props.saveEnabled,
        onClick: (e)=>this.forwardEvent("save"),
        subMenuProps: {
          items: [
            {
              key: "saveas",
              text: "Save As",
              iconProps: { iconName: "SaveAs" },
              onClick: (e)=>this.forwardEvent("saveas")
            },
          ],
        },
      },
    ];

    return <CommandBar items={_items} />;
  }

  forwardEvent(mode) {
    let handler = null;
    switch(mode) {
      case "new":
        handler = this.props.onNewClick ?? null;
        break;
      case "open":
        handler = this.props.onOpenClick ?? null;
        break;
      case "save":
        handler = this.props.onSaveClick ?? null;
        break;
      case "saveas":
        handler = this.props.onSaveAsClick ?? null;
        break;
    }
    if(handler != null)
      handler();
  }
}

export default AppCommandBar;
