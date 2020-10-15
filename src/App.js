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
import { AssetSelectModal } from "./AssetSelectModal";

initializeIcons();

const exampleData_ = [
  {
    name: "UD Jaya",
    purchaseDate: "1970-01-01",
    renewalDate: "2021-09-09",
    sellDate: null,
    remark: "Tanah utama",
    areas: [
      {
        name: "Toko Utama",
        purchaseDate: null,
        renewalDate: null,
        sellDate: null,
        remark: null,
        points: [
          [-6.892677, 112.06192],
          [-6.892801, 112.061859],
          [-6.892937, 112.06187],
          [-6.892979, 112.061964],
          [-6.892738, 112.062067],
        ],
      },
      {
        name: "Gudang Semen New",
        purchaseDate: "2008-01-01",
        renewalDate: "2021-09-09",
        sellDate: null,
        remark: "Khusus simpan semen",
        points: [
          [-6.893262, 112.062028],
          [-6.893355, 112.061996],
          [-6.893379, 112.062055],
          [-6.893677, 112.061905],
          [-6.893757, 112.062004],
          [-6.893592, 112.062071],
          [-6.893549, 112.062152],
          [-6.893347, 112.062227],
        ],
      },
    ],
  },
  {
    name: "Depo Jaya",
    purchaseDate: "2011-01-01",
    renewalDate: null,
    sellDate: null,
    remark: "Swalayan",
    areas: [
      {
        name: "Gedung Utama",
        purchaseDate: null,
        renewalDate: null,
        sellDate: null,
        remark: null,
        points: [
          [-6.892327, 112.061006],
          [-6.893272, 112.060684],
          [-6.893374, 112.061095],
          [-6.892426, 112.061336],
        ],
      },
    ],
  },
];

class App extends React.Component {
  constructor(props) {
    super(props);

    // TODO: remove example data
    this.state = {
      sidebarWidth: 300,
      data: exampleData_,
      hasChanges: false,
      showAssetSelectModal: false,
    };
    this.sepResize = false;

    this.onSepMouseDown = this.onSepMouseDown.bind(this);
    this.onSepMouseUp = this.onSepMouseUp.bind(this);
    this.onSepMouseMove = this.onSepMouseMove.bind(this);
    this.newFile = this.newFile.bind(this);
    this.promptOpenFile = this.promptOpenFile.bind(this);
    this.saveFile = this.saveFile.bind(this);
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
        />
        <div className="app-content">
          <AppSideBar
            width={this.state.sidebarWidth}
            data={this.state.data}
            onSelectAsset={() => this.setState({ showAssetSelectModal: true })}
          />
          <VerticalSeparator onMouseDown={this.onSepMouseDown} />
          <div id="gmap"></div>
        </div>
        {/* Dialogs */}
        <DiscardDialog
          hidden={!this.state.showDismissDialog}
          onDismiss={() => this.setState({ showDismissDialog: false })}
        />
        <AssetSelectModal
          isOpen={this.state.showAssetSelectModal}
          onDismiss={() => this.setState({ showDismissDialog: false })}
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
      // TODO: new file
    }
  }

  promptOpenFile() {
    if (this.promptDismissOrSave(this.newFile)) {
      this.fileHandle = window.chooseFileSystemEntries();
      // TODO: change state to that represented from file
    }
  }

  saveFile() {
    // TODO: save file
    console.error("File saving not implemented!");
  }

  saveAsFile() {
    this.fileHandle = window.chooseFileSystemEntries({ type: "saveFile" });
  }

  /**
   * @returns false if there is an unmodified changes pending and a dialog is shown, true otherwise.
   */
  promptDismissOrSave(nextOp) {
    if (this.state.hasChanges) {
      this.nextOp = nextOp;
      this.setState({ showDismissDialog: true });
      return false;
    }
    return true;
  }
}

export default App;
