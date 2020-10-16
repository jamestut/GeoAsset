import React from "react";

import { Modal } from "office-ui-fabric-react";

import { TextField } from "office-ui-fabric-react/lib/TextField";
import { Toggle } from "office-ui-fabric-react/lib/Toggle";
import { Fabric } from "office-ui-fabric-react/lib/Fabric";
import { Announced } from "office-ui-fabric-react/lib/Announced";
import {
  DetailsList,
  DetailsListLayoutMode,
  Selection,
  SelectionMode,
  IColumn,
} from "office-ui-fabric-react/lib/DetailsList";
import { MarqueeSelection } from "office-ui-fabric-react/lib/MarqueeSelection";
import { mergeStyleSets } from "office-ui-fabric-react/lib/Styling";
import { Panel, PanelType } from "office-ui-fabric-react/lib/Panel";

class AssetsListOverview extends React.Component {
  _selection;

  constructor(props) {
    super(props);

    const columns = [
      {
        key: "column1",
        name: "Name",
        fieldName: "name",
        onColumnClick: this._onColumnClick,
        isPadded: true,
        isRowHeader: true,
        isResizable: true,
      },
      {
        key: "column2",
        name: "Purchase Date",
        fieldName: "purchaseDate",
        isResizable: true,
        onColumnClick: this._onColumnClick,
        data: "date",
        isPadded: true,
        onRender: (item) => this._renderDate(item.purchaseDate),
      },
      {
        key: "column3",
        name: "Renewal Date",
        fieldName: "renewalDate",
        isResizable: true,
        onColumnClick: this._onColumnClick,
        data: "date",
        isPadded: true,
        onRender: (item) => this._renderDate(item.renewalDate),
      },
      {
        key: "column4",
        name: "Sold",
        fieldName: "sellDate",
        isResizable: true,
        isCollapsible: true,
        data: "date",
        onColumnClick: this._onColumnClick,
        isPadded: true,
        onRender: (item) => this._renderDate(item.sellDate),
      },
      {
        key: "column5",
        name: "Area",
        fieldName: "computedArea",
        isResizable: true,
        isCollapsible: true,
        data: "number",
        onColumnClick: this._onColumnClick,
        onRender: (item) => {
          return (
            <span>
              {Math.round(item.computedArea)} m<sup>2</sup>
            </span>
          );
        },
      },
    ];

    this._selection = new Selection({
      onSelectionChanged: () => {
        this.setState({
          selectionDetails: this._getSelectionDetails(),
        });
      },
    });

    this.state = {
      items: this.props.items,
      columns: columns,
      selectionDetails: this._getSelectionDetails(),
      isModalSelection: false,
      isCompactMode: false,
    };
  }

  render() {
    const { columns } = this.state;

    return (
      <DetailsList
        items={this.state.items}
        compact={true}
        columns={columns}
        selectionMode={SelectionMode.multiple}
        getKey={this._getKey}
        setKey="none"
        layoutMode={DetailsListLayoutMode.justified}
        isHeaderVisible={true}
        onItemInvoked={this._onItemInvoked}
      />
    );
  }

  _renderDate(item) {
    if (!item) {
      return <span>(none)</span>;
    }
    return <span>{item.toDateString()}</span>;
  }

  _getKey(item, index) {
    return item.key;
  }

  _onItemInvoked(item) {
    alert(`Item invoked: ${item.name}`);
  }

  _getSelectionDetails() {
    const selectionCount = this._selection.getSelectedCount();

    switch (selectionCount) {
      case 0:
        return "No items selected";
      case 1:
        return "1 item selected: " + this._selection.getSelection()[0].name;
      default:
        return `${selectionCount} items selected`;
    }
  }

  _copyAndSort(items, columnKey, isSortedDescending) {
    const key = columnKey;
    return items
      .slice(0)
      .sort((a, b) =>
        (isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1
      );
  }

  _onColumnClick = (ev, column) => {
    const { columns } = this.state;
    const items = this.props.items;
    const newColumns = columns.slice();
    const currColumn = newColumns.filter(
      (currCol) => column.key === currCol.key
    )[0];
    newColumns.forEach((newCol) => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;
      } else {
        newCol.isSorted = false;
        newCol.isSortedDescending = true;
      }
    });
    const newItems = this._copyAndSort(
      items,
      currColumn.fieldName,
      currColumn.isSortedDescending
    );
    this.setState({
      columns: newColumns,
      items: newItems,
    });
  };
}

export class AssetSelectModal extends React.Component {
  constructor(props) {
    super(props);

    this.forwardEvent = this.forwardEvent.bind(this);
  }

  render() {
    return (
      <Panel
        type={PanelType.smallFluid}
        isOpen={this.props.isOpen}
        headerText="Select Asset"
        onDismiss={(e) => this.forwardEvent(this.props.onDismiss)}
      >
        <AssetsListOverview items={this.props.items} />
      </Panel>
    );
  }

  forwardEvent(handler) {
    if (handler) handler();
  }
}
