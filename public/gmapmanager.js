"use strict";

window.gmapReady = false;

function GMapReadyCallback() {
  let el = document.querySelector("#gmap");
  if (!(el == null)) {
    initGMap();
  } else {
    window.gmapReady = true;
  }
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
}

function computeArea(coords) {
  // TODO: check correctness
  let gmCoords = [];
  coords.forEach((c) => {
    gmCoords.push(new google.maps.LatLng({ lat: c[0], lng: c[1] }));
  });
  return google.maps.geometry.spherical.computeArea(gmCoords);
}
