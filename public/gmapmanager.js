"use strict";

window.gmapReady = false;

let polyEditor = { active: false };

function GMapReadyCallback() {
  let el = document.querySelector("#gmap");
  if (!(el == null)) {
    initGMap();
  } else {
    window.gmapReady = true;
  }
}

function setupClasses() {
  window.mapClasses = {};

  mapClasses.MapMenu = class MapMenu extends google.maps.OverlayView {
    constructor(menuList) {
      super();
      this.div_ = document.createElement("div");
      this.div_.className = "gmaps-menu";

      // fill in menu
      let lst = document.createElement("ul");
      menuList.forEach((menuDesc) => {
        let menuItem = document.createElement("li");
        menuItem.innerHTML = menuDesc.caption;
        menuItem.callback = menuDesc.callback;
        menuItem.cbData = menuDesc.cbData;
        lst.appendChild(menuItem);
      });

      google.maps.event.addDomListener(
        this.div_,
        "mousedown",
        (e) => {
          e.preventDefault();
          let target = e.path[0];
          let callback = target.callback;
          if (!callback) return;
          callback(target.cbData);
        },
        true
      );

      this.div_.appendChild(lst);
    }
    onAdd() {
      const menu = this;
      const map = this.getMap();
      this.getPanes().floatPane.appendChild(this.div_);
      this.divListener_ = google.maps.event.addDomListener(
        map.getDiv(),
        "mousedown",
        (e) => {
          menu.close();
        },
        true
      );
    }
    onRemove() {
      if (this.divListener_) {
        google.maps.event.removeListener(this.divListener_);
      }
      this.div_.parentNode.removeChild(this.div_);
      // clean up
      this.set("position", null);
    }
    close() {
      this.setMap(null);
    }
    draw() {
      const position = this.get("position");
      const projection = this.getProjection();

      if (!position || !projection) {
        return;
      }
      const point = projection.fromLatLngToDivPixel(position);
      this.div_.style.top = point.y + "px";
      this.div_.style.left = point.x + "px";
    }
    /**
     * Opens the menu at a the click position.
     */
    open(map, pos) {
      this.set("position", pos);
      this.setMap(map);
      this.draw();
    }
  };
}

function initGMap() {
  let gmapEl = document.querySelector("#gmap");
  window.gmapObj = new google.maps.Map(gmapEl, {
    center: { lat: -6.218089, lng: 106.847992 },
    zoom: 6,
  });

  // setup precision trackpad scrolling
  var evtOpts = {
    capture: true,
    passive: false,
  };

  gmapEl.addEventListener(
    "wheel",
    (e) => {
      if (gmapObj != null) {
        if (!e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
          let pos = gmapObj.getCenter();
          let zoom = gmapObj.getZoom();
          let deltaFactor = 1 / Math.pow(2, zoom);
          gmapObj.setCenter({
            lat: pos.lat() - e.deltaY * deltaFactor,
            lng: pos.lng() + e.deltaX * deltaFactor,
            noWrap: true,
          });
        }
      }
    },
    evtOpts
  );

  setupClasses();
}

function computeArea(coords) {
  let gmCoords = [];
  coords.forEach((c) => {
    gmCoords.push(new google.maps.LatLng({ lat: c[0], lng: c[1] }));
  });
  return google.maps.geometry.spherical.computeArea(gmCoords);
}

function openPolyEditor(polyData, callback) {
  if (polyEditor.active) return;

  if (polyData && polyData.length) {
    let center = { lat: 0, lng: 0 };
    let minMax = {
      latMin: Infinity,
      lngMin: Infinity,
      latMax: -Infinity,
      lngMax: -Infinity,
    };
    polyEditor.baseCoords = [];
    polyData.forEach((arr) => {
      polyEditor.baseCoords.push({ lat: arr[0], lng: arr[1] });
      center.lat += arr[0];
      center.lng += arr[1];
      if (arr[0] < minMax.latMin) minMax.latMin = arr[0];
      if (arr[0] > minMax.latMax) minMax.latMax = arr[0];
      if (arr[1] < minMax.lngMin) minMax.lngMin = arr[1];
      if (arr[1] > minMax.lngMax) minMax.lngMax = arr[1];
    });
    center.lat /= polyData.length;
    center.lng /= polyData.length;
    gmapObj.setCenter(center);

    // compute the perfect zoom level
    let magnitude = Math.max(
      Math.abs(minMax.latMin - minMax.latMax),
      Math.abs(minMax.lngMin - minMax.lngMax)
    );
    let targetZoomLevel = 23;
    for (targetZoomLevel = 23; targetZoomLevel > 0; --targetZoomLevel) {
      if (magnitude < 1000.0 / 2 ** targetZoomLevel) break;
    }
    gmapObj.setZoom(targetZoomLevel);
  } else {
    // create a new rectangle based on current position
    const currPos = gmapObj.getCenter();
    const zoomLevel = gmapObj.getZoom();
    const delta = 100.0 / 2 ** zoomLevel;
    polyEditor.baseCoords = [
      { lat: currPos.lat() - delta, lng: currPos.lng() - delta },
      { lat: currPos.lat() + delta, lng: currPos.lng() - delta },
      { lat: currPos.lat() + delta, lng: currPos.lng() + delta },
      { lat: currPos.lat() - delta, lng: currPos.lng() + delta },
    ];
  }

  polyEditor.callback = callback;

  if (!polyEditor.poly) {
    polyEditor.poly = new google.maps.Polygon({
      paths: polyEditor.baseCoords,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      editable: true,
    });

    // setup action menus
    let vertexDeleteMenuCbData = { vertex: null, obj: polyEditor.poly };
    const vertexDeleteMenu = new mapClasses.MapMenu([
      {
        caption: "Delete",
        callback: deleteVertex,
        cbData: vertexDeleteMenuCbData,
      },
    ]);
    google.maps.event.addListener(polyEditor.poly, "rightclick", (e) => {
      if (!polyEditor.active) return;
      // Check if click was on a vertex control point
      if (e.vertex == undefined) {
        return;
      }
      vertexDeleteMenuCbData.vertex = e.vertex;
      vertexDeleteMenu.open(gmapObj, e.latLng);
    });

    const optionMenu = new mapClasses.MapMenu([
      { caption: "Save", callback: endPolyEditor, cbData: true },
      { caption: "Discard", callback: endPolyEditor, cbData: false },
    ]);
    google.maps.event.addListener(gmapObj, "rightclick", (e) => {
      if (!polyEditor.active) return;
      optionMenu.open(gmapObj, e.latLng);
    });
  } else {
    polyEditor.poly.setPath(polyEditor.baseCoords);
  }

  polyEditor.poly.setMap(gmapObj);
  polyEditor.active = true;
}

function endPolyEditor(save) {
  if (window.confirm(`${save ? "Save" : "Discard"} edited area?`)) {
    polyEditor.poly.setMap(null);
    polyEditor.active = false;

    if (polyEditor.callback) {
      let cbData = null;
      if (save) {
        cbData = [];
        polyEditor.poly.getPath().forEach((pth) => {
          cbData.push([pth.lat(), pth.lng()]);
        });
      }
      polyEditor.callback(cbData);
    }
  }
}

function deleteVertex(v) {
  v.obj.getPath().removeAt(v.vertex);
}
