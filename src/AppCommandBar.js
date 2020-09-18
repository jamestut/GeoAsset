import * as React from "react";
import {
  CommandBar,
  ICommandBarItemProps,
} from "office-ui-fabric-react/lib/CommandBar";
import { IButtonProps } from "office-ui-fabric-react/lib/Button";

const overflowProps = { ariaLabel: "More commands" };

const _items = [
  {
    key: "newItem",
    text: "New",
    cacheKey: "myCacheKey", // changing this key will invalidate this item's cache
    iconProps: { iconName: "Add" },
  },
  {
    key: "open",
    text: "Open",
    iconProps: { iconName: "FabricOpenFolderHorizontal" },
  },
  {
    key: "save",
    text: "Save",
    iconProps: { iconName: "Save" },
    subMenuProps: {
      items: [
        {
          key: "saveAs",
          text: "Save As",
          iconProps: { iconName: "SaveAs" },
        },
      ],
    },
    //onClick: () => console.log('Share'),
  },
];

class AppCommandBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <CommandBar items={_items} />;
  }
}

export default AppCommandBar;
