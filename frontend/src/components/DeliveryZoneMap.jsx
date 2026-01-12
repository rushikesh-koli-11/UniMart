import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polygon, useMap } from "react-leaflet";
import L from "leaflet";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


export const solapurBoundary = [
  [17.7206, 75.868],
  [17.7044, 75.9421],
  [17.6735, 75.9717],
  [17.6333, 75.9606],
  [17.6069, 75.9149],
  [17.6124, 75.8592],
  [17.6574, 75.8385],
  [17.7011, 75.8448],
  [17.7206, 75.868],
];


function Recenter({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords && map) {
      setTimeout(() => {
        map.setView(coords, 13);
      }, 100); 
    }
  }, [coords]);

  return null;
}

export default function DeliveryZoneMap({ coords }) {
  const [ready, setReady] = useState(false);

  return (
    <div
      style={{
        height: "300px",
        width: "100%",
        borderRadius: "10px",
        overflow: "hidden",
        marginTop: "20px",
      }}
    >
      <MapContainer
        center={[17.6599, 75.9064]}
        zoom={12}
        whenCreated={() => setReady(true)}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Polygon positions={solapurBoundary} pathOptions={{ color: "green", fillOpacity: 0.12 }} />

        {ready && coords && (
          <>
            <Marker position={coords} />
            <Recenter coords={coords} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
