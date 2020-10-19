"use strict";

window.gmapReady = false;

let polyEditor = { active: false };
let polyShow = {};

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
    polyEditor.baseCoords = [];
    polyData.forEach((arr) => {
      polyEditor.baseCoords.push({ lat: arr[0], lng: arr[1] });
    });
    computeAndSetCenterAndZoom([polyData]);
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
  // hide the view polygon
  if (polyShow.data) polyShow.data.forEach((poly) => poly.setMap(null));
}

function endPolyEditor(save) {
  if (window.confirm(`${save ? "Save" : "Discard"} edited area?`)) {
    polyEditor.poly.setMap(null);
    polyEditor.active = false;
    // show the hidden view polygon again
    if (polyShow.data) polyShow.data.forEach((poly) => poly.setMap(gmapObj));

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

    // confirm to caller that user has confirmed the change
    return true;
  }
  return false;
}

function showPolys(polyset) {
  if (polyShow.data) {
    polyShow.data.forEach((poly) => poly.setMap(null));
  }
  polyShow.data = [];
  polyset.forEach((rawPoly) => {
    let paths = [];
    rawPoly.forEach((c) => paths.push({ lat: c[0], lng: c[1] }));
    let poly = new google.maps.Polygon({
      paths: paths,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      editable: false,
    });
    if (!polyEditor.active) poly.setMap(gmapObj);
    polyShow.data.push(poly);
  });
  if (!polyEditor.active) computeAndSetCenterAndZoom(polyset);
}

function deleteVertex(v) {
  v.obj.getPath().removeAt(v.vertex);
}

function computeAndSetCenterAndZoom(polys) {
  let center = { lat: 0, lng: 0 };
  let minMax = {
    latMin: Infinity,
    lngMin: Infinity,
    latMax: -Infinity,
    lngMax: -Infinity,
  };

  //coordinates count
  let cCount = 0;
  polys.forEach((poly) => {
    poly.forEach((c) => {
      ++cCount;
      if (c[0] < minMax.latMin) minMax.latMin = c[0];
      if (c[0] > minMax.latMax) minMax.latMax = c[0];
      if (c[1] < minMax.lngMin) minMax.lngMin = c[1];
      if (c[1] > minMax.lngMax) minMax.lngMax = c[1];
      center.lat += c[0];
      center.lng += c[1];
    });
  });
  if (!cCount) return;

  // center to the average
  center.lat /= cCount;
  center.lng /= cCount;
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
}
