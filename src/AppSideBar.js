import * as React from "react";
import { SearchBox } from "office-ui-fabric-react/lib/SearchBox";
import { IconButton } from "office-ui-fabric-react";
import { Nav } from "office-ui-fabric-react/lib/Nav";
import {
  PrimaryButton,
  DefaultButton,
} from "office-ui-fabric-react/lib/Button";
import {
  CommandBar,
  ICommandBarItemProps,
} from "office-ui-fabric-react/lib/CommandBar";
import { Label } from "office-ui-fabric-react/lib/Label";
import { Separator } from "office-ui-fabric-react/lib/Separator";
import "./AppSideBar.css";

/* examples */
let items = [
  {
    links: [
      {
        name: "Home",
        expandAriaLabel: "Expand Home section",
        collapseAriaLabel: "Collapse Home section",
        links: [
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
        ],
        isExpanded: true,
      },
      {
        name: "Documents",
        url: "http://example.com",
        key: "key3",
        isExpanded: true,
        target: "_blank",
      },
      {
        name: "Pages",
        url: "http://msn.com",
        key: "key4",
        target: "_blank",
      },
      {
        name: "Notebook",
        url: "http://msn.com",
        key: "key5",
        disabled: true,
      },
      {
        name: "Communication and Media",
        url: "http://msn.com",
        key: "key6",
        target: "_blank",
      },
      {
        name: "News",
        url: "http://cnn.com",
        icon: "News",
        key: "key7",
        target: "_blank",
      },
    ],
  },
];

class AppSideBar extends React.Component {
  constructor(props) {
    super(props);

    this.onBasicClick = this.onBasicClick.bind(this);
    this.onLinkClick = this.onLinkClick.bind(this);
  }

  render() {
    return (
      <div
        className="appsidebar-cont"
        style={{ width: `${this.props.width}px` }}
      >
        <div className="appsidebar-mainasset">
          <Label styles={{ root: { textAlign: "center" } }}>
            {this.props.selectedAssetName}
          </Label>
          <DefaultButton
            text="Open Assets List"
            onClick={() => this.onBasicClick(this.props.onSelectAsset)}
          />
          <Separator />
          <div className="appsidebar-subasset-cmdbar">
            <div>
              <IconButton
                title="New region"
                iconProps={{ iconName: "Add" }}
                onClick={() => this.onBasicClick(this.props.onAddSub)}
                disabled={!this.props.selectedAsset}
              />
              <IconButton
                title="Delete selected region"
                iconProps={{ iconName: "Remove" }}
                onClick={() => this.onBasicClick(this.props.onRemoveSub)}
                disabled={!this.props.selectedSubAsset}
              />
            </div>
            <div>
              <IconButton
                title="Clear selection"
                iconProps={{ iconName: "ClearSelection" }}
                onClick={() => this.onBasicClick(this.props.onClearSelection)}
                disabled={!this.props.selectedSubAsset}
              />
              <IconButton
                title="Information about selected region"
                iconProps={{ iconName: "Info" }}
                onClick={() => this.onBasicClick(this.props.onSubInfo)}
                disabled={!this.props.selectedSubAsset}
              />
            </div>
          </div>
          <Separator />
        </div>
        <div className="appsidebar-nav-cont">
          <Nav
            styles={{ root: { overflowY: "auto" } }}
            groups={items}
            onLinkClick={this.onLinkClick}
          />
        </div>
      </div>
    );
  }

  onBasicClick(handler) {
    if (handler) handler();
  }

  onLinkClick(e, item) {
    if (this.props.onItemClick) {
      this.props.onItemClick(item);
    }
  }
}

export default AppSideBar;
