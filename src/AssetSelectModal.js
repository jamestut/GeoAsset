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
import {
  CommandBar,
  ICommandBarItemProps,
} from "office-ui-fabric-react/lib/CommandBar";

class AssetsListOverview extends React.Component {
  _selection;

  constructor(props) {
    super(props);

    this._propagateSelectionDetails = this._propagateSelectionDetails.bind(
      this
    );

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
      onSelectionChanged: this._propagateSelectionDetails,
    });

    this.state = {
      items: this.props.items,
      columns: columns,
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
        selection={this._selection}
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

  _propagateSelectionDetails() {
    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(this._selection);
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

    this.state = {
      selection: { count: 0 },
    };

    this.forwardEvent = this.forwardEvent.bind(this);
    this.forwardEventWithSelections = this.forwardEventWithSelections.bind(
      this
    );
    this.renderPanelHeader = this.renderPanelHeader.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);
  }

  render() {
    return (
      <Panel
        type={PanelType.smallFluid}
        isOpen={this.props.isOpen}
        onRenderHeader={this.renderPanelHeader}
        onDismiss={(e) => this.forwardEvent(this.props.onDismiss)}
      >
        <AssetsListOverview
          items={this.props.items}
          onSelectionChange={this.onSelectionChange}
        />
      </Panel>
    );
  }

  forwardEvent(handler) {
    if (handler) handler();
  }

  forwardEventWithSelections(handler) {
    if (handler) handler(this.state.selection);
  }

  onSelectionChange(sel) {
    this.setState({ selection: sel });
  }

  renderPanelHeader() {
    const _items = [
      {
        key: "open",
        text: "Open",
        iconProps: { iconName: "FolderOpen" },
        disabled: this.state.selection.count != 1,
        ariaLabel: "Open",
        onClick: (e) => this.forwardEventWithSelections(this.props.onOpenClick),
      },
      {
        key: "add",
        text: "Add",
        cacheKey: "myCacheKey", // changing this key will invalidate this item's cache
        iconProps: { iconName: "Add" },
        ariaLabel: "Add",
        onClick: (e) => this.forwardEvent(this.props.onAddClick),
      },
      {
        key: "edit",
        text: "Edit",
        iconProps: { iconName: "Edit" },
        disabled: this.state.selection.count != 1,
        onClick: (e) => this.forwardEventWithSelections(this.props.onEditClick),
      },
      {
        key: "delete",
        text: "Delete",
        iconProps: { iconName: "Delete" },
        disabled: this.state.selection.count == 0,
        onClick: (e) =>
          this.forwardEventWithSelections(this.props.onDeleteClick),
      },
    ];

    return (
      <div style={{ width: "100%" }}>
        <CommandBar items={_items} />
      </div>
    );
  }
}
