import React from "react";
import {
  Stack,
  IStackStyles,
  IStackTokens,
  IStackItemStyles,
} from "office-ui-fabric-react/lib/Stack";
import {
  Nav,
  INavLink,
  INavStyles,
  INavLinkGroup,
} from "office-ui-fabric-react/lib/Nav";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";

import AppCommandBar from "./AppCommandBar";
import AppSideBar from "./AppSideBar";
import { VerticalSeparator } from "./Separator";

import "./App.css";
import { render } from "@testing-library/react";
import { DiscardDialog } from "./DiscardDialog";
import { CommonEditDialog } from "./CommonEditDialog";
import { AssetSelectModal } from "./AssetSelectModal";

initializeIcons();

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sidebarWidth: 300,
      data: [] /*Main application data*/,
      editObject: {} /*Currently edited asset*/,
      hasChanges: false,
      showAssetSelectModal: false,
      fileHandle: null,
      selectedAsset: null,
      polyEditMode: false,
    };
    this.sepResize = false;

    this.onSepMouseDown = this.onSepMouseDown.bind(this);
    this.onSepMouseUp = this.onSepMouseUp.bind(this);
    this.onSepMouseMove = this.onSepMouseMove.bind(this);
    this.newFile = this.newFile.bind(this);
    this.newFileAction = this.newFileAction.bind(this);
    this.promptOpenFile = this.promptOpenFile.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.saveAsFile = this.saveAsFile.bind(this);
    this.saveFileAction = this.saveFileAction.bind(this);
    this.openAsset = this.openAsset.bind(this);
    this.addAsset = this.addAsset.bind(this);
    this.editAsset = this.editAsset.bind(this);
    this.editArea = this.editArea.bind(this);
    this.deleteAsset = this.deleteAsset.bind(this);
    this.deleteSubAsset = this.deleteSubAsset.bind(this);
    this.onSaveCommonEdit = this.onSaveCommonEdit.bind(this);
    this.discardDialogSave = this.discardDialogSave.bind(this);
    this.discardDialogDiscard = this.discardDialogDiscard.bind(this);
    this.discardDialogProceed = this.discardDialogProceed.bind(this);
    this.reindexData = this.reindexData.bind(this);
    this.editAreaCallback = this.editAreaCallback.bind(this);
    this.subAssetSelectionChanged = this.subAssetSelectionChanged.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousemove", this.onSepMouseMove);
    document.addEventListener("mouseup", this.onSepMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.onSepMouseMove);
    document.removeEventListener("mouseup", this.onSepMouseUp);
  }

  render() {
    return (
      <div className="app-root">
        <AppCommandBar
          saveEnabled={this.state.hasChanges}
          onNewClick={this.newFile}
          onOpenClick={this.promptOpenFile}
          onSaveClick={this.saveFile}
          onSaveAsClick={this.saveAsFile}
          disabled={this.state.polyEditMode}
        />
        <div className="app-content">
          <AppSideBar
            width={this.state.sidebarWidth}
            data={this.state.selectedAsset}
            onSelectAsset={() => this.setState({ showAssetSelectModal: true })}
            onAddSub={() => this.addAsset(true)}
            onInfoSub={(sel) => this.editAsset(true, sel)}
            onEditSub={this.editArea}
            onDeleteSub={this.deleteSubAsset}
            onSelectionChanged={this.subAssetSelectionChanged}
            disabled={this.state.polyEditMode}
          />
          <VerticalSeparator onMouseDown={this.onSepMouseDown} />
          <div id="gmap"></div>
        </div>
        {/* Dialogs */}
        <DiscardDialog
          hidden={!this.state.showDismissDialog}
          onSave={this.discardDialogSave}
          onDiscard={this.discardDialogDiscard}
          onDismiss={() => this.setState({ showDismissDialog: false })}
        />
        <CommonEditDialog
          title={this.state.editDialogTitle}
          hidden={!this.state.showEditDialog}
          data={this.state.editObject}
          onDismiss={() => this.setState({ showEditDialog: false })}
          onSave={this.onSaveCommonEdit}
        />
        <AssetSelectModal
          items={this.state.data}
          isOpen={this.state.showAssetSelectModal}
          onDismiss={() => {
            if (!this.state.showEditDialog)
              this.setState({ showAssetSelectModal: false });
          }}
          onOpenClick={this.openAsset}
          onAddClick={() => this.addAsset(false)}
          onEditClick={(sel) => this.editAsset(false, sel)}
          onDeleteClick={this.deleteAsset}
        />
      </div>
    );
  }

  /* Divider resize */
  onSepMouseDown(e) {
    this.sepResize = true;
    this.sepSizeRef = this.state.sidebarWidth;
    this.sepSizeSrcX = e.screenX;
  }

  onSepMouseUp(e) {
    this.sepResize = false;
  }

  onSepMouseMove(e) {
    if (this.sepResize) {
      this.setState({
        sidebarWidth: this.sepSizeRef + e.screenX - this.sepSizeSrcX,
      });
    }
  }

  /* File management */
  newFile() {
    if (this.promptDismissOrSave(this.newFile)) {
      this.newFileAction();
    }
  }

  newFileAction() {
    this.setState({
      fileHandle: null,
      data: [],
      hasChanges: false,
      selectedAsset: null,
    });
  }

  async promptOpenFile() {
    if (this.promptDismissOrSave(this.newFile)) {
      let fileHandle = await this.showFileDialog(false);
      if (fileHandle) {
        this.setState({ fileHandle: fileHandle });
        await this.loadFile();
      }
    }
  }

  saveFile() {
    if (this.state.hasChanges) {
      this.saveFileAction();
    }
  }

  async saveFileAction() {
    if (!this.state.fileHandle) {
      return await this.saveAsFile();
    }

    // generate data
    let trans = [];
    this.state.data.forEach((asset) => {
      const fillBasicProperties = (target, src) => {
        ["name", "remark"].forEach((prop) => {
          target[prop] = src[prop] ? src[prop] : null;
        });
        ["purchaseDate", "renewalDate", "sellDate"].forEach((prop) => {
          let currDate = src[prop];
          target[prop] = currDate
            ? new Date().toISOString().split("T")[0]
            : null;
        });
      };

      let cAsset = { areas: [] };
      fillBasicProperties(cAsset, asset);

      asset.areas.forEach((subAsset) => {
        let cSa = { points: subAsset.points };
        fillBasicProperties(cSa, subAsset);
        cAsset.areas.push(cSa);
      });

      trans.push(cAsset);
    });

    // try save
    const serObj = JSON.stringify(trans);
    let writable;
    try {
      writable = await this.state.fileHandle.createWritable();
    } catch (e) {
      alert("Error opening file for writing.");
      return false;
    }

    let success = false;
    try {
      await writable.truncate(0);
      await writable.write(serObj);
      success = true;
    } catch (e) {
      alert("Error saving file.");
    } finally {
      await writable.close();
    }

    if (success) this.setState({ hasChanges: false });
    return success;
  }

  async saveAsFile() {
    let newFh = await this.showFileDialog(true);
    if (newFh) {
      this.setState({ fileHandle: newFh });
      return this.saveFileAction();
    }
    return false;
  }

  async showFileDialog(write) {
    const opts = {
      types: [
        {
          description: "JSON GeoAsset Files",
          accept: {
            "application/json": [".json"],
          },
        },
      ],
    };
    // for debugging. this is a new API afterall, introduced in Chromium 86.
    try {
      if (write) {
        return await window.showSaveFilePicker(opts);
      } else {
        let [res] = await window.showOpenFilePicker(opts);
        return res;
      }
    } catch (e) {
      // assume cancelled
      return null;
    }
  }

  async loadFile() {
    let newData = [];
    if (!this.state.fileHandle) return;
    try {
      const file = await this.state.fileHandle.getFile();
      const text = await file.text();
      let obj = JSON.parse(text);
      obj = this.sanitizeAssets(obj);
      if (!obj) {
        alert("Invalid file format.");
        obj = [];
      }
      newData = obj;
      this.reindexData(0, newData);
    } catch (e) {
      alert("Error opening file.");
    }
    this.setState({ data: newData, hasChanges: false, selectedAsset: null });
  }

  /**
   * @param hint If provided, start looking from the given index instead.
   */
  reindexData(hint, pData) {
    // in-place modification w/o having to reset state, as indices data should
    // not be visible in any of the UI
    let data = pData ?? this.state.data;
    if (!data) return;
    const begin = hint ?? 0;
    for (let i = begin; i < data.length; ++i) {
      data[i]["index"] = i;
    }
  }

  discardDialogProceed() {
    this.setState({ showDismissDialog: false });
    this.skipDismissDialog = true;
    if (this.nextOp) this.nextOp();
  }

  async discardDialogSave() {
    if (await this.saveFileAction()) {
      this.discardDialogProceed();
    }
  }

  discardDialogDiscard() {
    this.newFileAction();
    this.discardDialogProceed();
  }

  sanitizeAssets(obj) {
    if (!Array.isArray(obj)) return null;
    let success = true;
    obj.forEach((item, idx, arr) => {
      if (!success) return;
      if (!(arr[idx] = this.sanitizeAssetObject(item))) {
        success = false;
      }
    });
    return success ? obj : null;
  }

  sanitizeAssetObject(obj) {
    if (!obj) {
      return null;
    }

    const parseDate = (datestr) => {
      let vn = Date.parse(datestr);
      if (isNaN(vn)) {
        return null;
      }
      return new Date(vn);
    };

    const checkNumeric = (nm) => {
      return typeof nm == "number" && !isNaN(nm) && isFinite(nm);
    };

    // subassets and main assets have some common props
    const baseSanitizer = (obj) => {
      try {
        // we don't really allow nameless assets
        if (typeof obj.name != "string") return null;
        if (typeof obj.remark != "string") obj.remark = null;
        obj.purchaseDate = parseDate(obj.purchaseDate);
        obj.renewalDate = parseDate(obj.renewalDate);
        obj.sellDate = parseDate(obj.renewalDate);
        return obj;
      } catch (e) {
        return null;
      }
    };

    // base assets
    let ret = baseSanitizer(obj);
    if (!ret) {
      return null;
    }

    obj.computedArea = 0;

    // check sub area assets
    if (!Array.isArray(obj.areas)) {
      return null;
    }
    obj.areas.forEach((subobj, idx, arr) => {
      if (!(arr[idx] = baseSanitizer(subobj))) {
        // we don't accept invalid areas
        return null;
      }
      if (!Array.isArray(subobj.points)) {
        // empty array no problem, but not invalid objects
        return null;
      }
      // check each point, make sure they're really points
      let pointsOk = true;
      subobj.points.forEach((pts) => {
        if (!pointsOk) return;
        if (
          !Array.isArray(pts) ||
          pts.length != 2 ||
          !checkNumeric(pts[0]) ||
          !checkNumeric(pts[1])
        ) {
          pointsOk = false;
        }
      });
      if (!pointsOk) {
        return null;
      }

      // compute area for this subasset
      obj.computedArea += subobj.computedArea = window.computeArea(
        subobj.points
      );
    });

    return ret;
  }

  /**
   * @returns false if there is an unmodified changes pending and a dialog is shown, true otherwise.
   */
  promptDismissOrSave(nextOp) {
    if (this.skipDismissDialog) {
      this.skipDismissDialog = false;
      return true;
    }
    if (this.state.hasChanges) {
      this.nextOp = nextOp;
      this.setState({ showDismissDialog: true });
      return false;
    }
    return true;
  }

  openAsset(sel) {
    this.setState({
      selectedAsset: sel.getSelection()[0],
      showAssetSelectModal: false,
    });
  }

  editAsset(isSub, sel) {
    this.editMode = true;
    this.editSubAsset = isSub;
    this.editObject = sel.getSelection()[0];

    let editObjPrs = {};
    this.copyAssetCommonProps(editObjPrs, this.editObject);

    this.setState({
      editObject: editObjPrs,
      editDialogTitle: "Edit Asset",
      showEditDialog: true,
    });
  }

  editArea(sel) {
    this.setState({ polyEditMode: true });
    this.polyEditObject = sel.getSelection()[0];
    window.openPolyEditor(this.polyEditObject.points, this.editAreaCallback);
  }

  editAreaCallback(newPoly) {
    let newState = { polyEditMode: false };
    if (newPoly) {
      this.polyEditObject.points = newPoly;
      newState.hasChanges = true;

      // computed area
      this.state.selectedAsset.computedArea -= this.polyEditObject.computedArea;
      this.state.selectedAsset.computedArea += this.polyEditObject.computedArea = window.computeArea(
        newPoly
      );

      // force refresh
      newState.selectedAsset = this.state.selectedAsset;
      newState.selectedAsset.areas = newState.selectedAsset.areas.slice(0);
    }
    this.setState(newState);
  }

  subAssetSelectionChanged(sel) {
    let polys = [];
    sel.getSelection().forEach((subasset) => polys.push(subasset.points));
    window.showPolys(polys);
  }

  addAsset(isSub) {
    this.editMode = false;
    this.editSubAsset = isSub;

    this.setState({
      editObject: {},
      editDialogTitle: "Add Asset",
      showEditDialog: true,
    });
  }

  deleteAsset(sel) {
    // sort descending to make it easier to delete
    let selIdx = [];
    sel.getSelection().forEach((item) => selIdx.push(item.index));
    if (selIdx.length) {
      if (!window.confirm(`Delete ${selIdx.length} items?`)) {
        return;
      }
    } else return;

    selIdx.sort((a, b) => b - a);
    let data = this.state.data;
    selIdx.forEach((idx) => {
      data.splice(idx, 1);
    });

    // reindex from the smallest index that we removed
    if (selIdx.length) this.reindexData(selIdx[selIdx.length - 1]);

    this.setState({
      data: data,
      selectedAsset: null,
      showAssetSelectModal: false,
    });
  }

  deleteSubAsset(sel) {
    let selIdx = sel
      .getSelectedIndices()
      .slice(0)
      .sort((a, b) => b - a);
    if (selIdx.length) {
      if (!window.confirm(`Delete ${selIdx.length} areas?`)) {
        return false;
      }
    } else return false;
    let data = this.state.selectedAsset;
    selIdx.forEach((idx) => {
      data.areas.splice(idx, 1);
    });
    // force update of the list
    data.areas = data.areas.slice(0);
    this.setState({ selectedAsset: data });
    return true;
  }

  copyAssetCommonProps(oldObj, newObj) {
    const props = ["name", "remark", "purchaseDate", "renewalDate", "sellDate"];
    props.forEach((prop) => {
      if (newObj[prop] === undefined) oldObj[prop] = null;
      else oldObj[prop] = newObj[prop];
    });
  }

  onSaveCommonEdit(data) {
    let newState = {
      showEditDialog: false,
      hasChanges: true,
    };
    if (!this.editSubAsset) {
      // asset editor
      let stor = this.state.data;
      if (!this.editMode) {
        // add
        let newObj = {};
        newObj.areas = [];
        newObj.computedArea = 0.0;
        this.copyAssetCommonProps(newObj, data);
        stor.push(newObj);
        // update index
        this.reindexData(stor.length - 1);
      } else {
        // edit common data
        this.copyAssetCommonProps(this.editObject, data);
      }
      newState.data = stor;
      newState.showAssetSelectModal = false; // for update
    } else {
      // subasset (area) editor
      if (!this.editMode) {
        let stor = this.state.selectedAsset.areas;
        // add
        let newObj = {};
        newObj.computedArea = 0.0;
        newObj.points = [];
        this.copyAssetCommonProps(newObj, data);
        stor.push(newObj);
      } else {
        // edit common data
        this.copyAssetCommonProps(this.editObject, data);
      }
      // force update sidebar
      this.state.selectedAsset.areas = this.state.selectedAsset.areas.slice(0);
      newState.selectedAsset = this.state.selectedAsset;
    }
    this.setState(newState);
  }
}

export default App;
