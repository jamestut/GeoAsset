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
import {
  DetailsList,
  DetailsListLayoutMode,
  Selection,
  SelectionMode,
  IColumn,
} from "office-ui-fabric-react/lib/DetailsList";
import "./AppSideBar.css";

const detailColumns = [
  {
    key: "column1",
    name: "Name",
    fieldName: "name",
    isRowHeader: true,
    isResizable: false,
  },
  {
    key: "column2",
    name: "Area",
    fieldName: "computedArea",
    isResizable: false,
    onRender: (item) => {
      return (
        <span>
          {Math.round(item.computedArea)} m<sup>2</sup>
        </span>
      );
    },
  },
];

class AppSideBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = { selection: { count: 0 } };

    this.onBasicClick = this.onBasicClick.bind(this);
    this.onSelClick = this.onSelClick.bind(this);
    this.saveSelectionDetails = this.saveSelectionDetails.bind(this);

    this._selection = new Selection({
      onSelectionChanged: this.saveSelectionDetails,
    });
  }

  render() {
    return (
      <div
        className="appsidebar-cont"
        style={{ width: `${this.props.width}px` }}
      >
        <div className="appsidebar-mainasset">
          <Label styles={{ root: { textAlign: "center" } }}>
            {(this.props.data ?? {}).name}
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
                disabled={!this.props.data}
              />
              <IconButton
                title="Delete selected region"
                iconProps={{ iconName: "Remove" }}
                onClick={() => this.onSelClick(this.props.onDeleteSub)}
                disabled={this.state.selection.count == 0}
              />
            </div>
            <div>
              <IconButton
                title="Edit points of the selected region"
                iconProps={{ iconName: "Edit" }}
                onClick={() => this.onSelClick(this.props.onEditSub)}
                disabled={this.state.selection.count != 1}
              />
              <IconButton
                title="Edit or view basic information of the selected region"
                iconProps={{ iconName: "Info" }}
                onClick={() => this.onSelClick(this.props.onInfoSub)}
                disabled={this.state.selection.count != 1}
              />
            </div>
          </div>
          <Separator />
        </div>
        <div className="appsidebar-nav-cont">
          <DetailsList
            compact={true}
            columns={detailColumns}
            items={(this.props.data ?? { areas: [] }).areas ?? []}
            selectionMode={SelectionMode.multiple}
            isHeaderVisible={true}
            selection={this._selection}
            styles={{ root: { overflowX: "hidden" } }}
          />
        </div>
      </div>
    );
  }

  onBasicClick(handler) {
    if (handler) {
      handler();
    }
  }

  onSelClick(handler) {
    if (handler) {
      handler(this._selection);
    }
  }

  saveSelectionDetails() {
    this.setState({ selection: this._selection });
  }
}

export default AppSideBar;
