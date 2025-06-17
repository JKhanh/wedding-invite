import React, { useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Create custom wedding venue marker icon
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-wedding-marker',
    html: `<div style="
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #31553d 0%, #4a7c59 100%);
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <div style="
        color: #ffffff;
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        line-height: 1;
      ">❤️</div>
      <div style="
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid #31553d;
      "></div>
    </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}

interface MapProps {
  venueCoords: [number, number]
  venueName: string
  venueLocation: string
  googleMapsUrl: string
  onZoomToggle: () => void
  zoomed: boolean
  t: (key: string) => string
}

const Map: React.FC<MapProps> = ({ 
  venueCoords, 
  venueName, 
  venueLocation, 
  googleMapsUrl,
  onZoomToggle,
  zoomed,
  t
}) => {
  const mapRef = useRef<any>(null)

  useEffect(() => {
    // Set default icon for all markers
    L.Marker.prototype.options.icon = DefaultIcon
  }, [])

  const handleZoom = () => {
    if (mapRef.current) {
      if (!zoomed) {
        // Zoom to maximum detail view of the venue
        mapRef.current.flyTo(venueCoords, 19, {
          duration: 1.5,
        })
      } else {
        // Zoom back to street/area view 
        mapRef.current.flyTo(venueCoords, 16, {
          duration: 1.5,
        })
      }
    }
    onZoomToggle()
  }

  return (
    <div style={{ position: 'relative', height: '25em', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem', overflow: 'hidden' }}>
      <MapContainer
        ref={mapRef}
        center={venueCoords}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
        maxZoom={19}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={venueCoords} icon={createCustomIcon()}>
          <Popup>
            <div className='text-center'>
              <a 
                href={googleMapsUrl} 
                target='_blank' 
                rel='noopener noreferrer'
                style={{
                  color: '#31553d',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => (e.target as HTMLElement).style.textDecoration = 'underline'}
                onMouseOut={(e) => (e.target as HTMLElement).style.textDecoration = 'none'}
              >
                {venueName}
              </a><br/>
              <span style={{ fontSize: '0.9em', color: '#666' }}>{venueLocation}</span><br/>
              <small style={{ color: '#888', fontSize: '0.8em' }}>{t('map.clickForDirections')}</small>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      <label className='btn btn-circle absolute top-0 right-0 m-2 btn-neutral swap swap-rotate z-[1000]'>
        <input type='checkbox' onChange={handleZoom} />
        <svg className='swap-off fill-current w-5' xmlns='http://www.w3.org/2000/svg' height='40' viewBox='0 -960 960 960' width='40'>
          <path d='M147.333-100 100-147.333l139.334-139.334H120v-66.666h233.333V-120h-66.666v-119.334L147.333-100Zm665.334 0L673.333-239.334V-120h-66.666v-233.333H840v66.666H720.666L860-147.333 812.667-100ZM120-606.667v-66.666h119.334L100-812.667 147.333-860l139.334 139.334V-840h66.666v233.333H120Zm486.667 0V-840h66.666v119.334l140.001-140.001 47.333 47.333-140.001 140.001H840v66.666H606.667Z' />
        </svg>
        <svg className='swap-on fill-current w-5' xmlns='http://www.w3.org/2000/svg' height='40' viewBox='0 -960 960 960' width='40'>
          <path d='M120-120v-233.333h66.666v119.334L326.667-374 374-326.667 233.999-186.666h119.334V-120H120Zm486.667 0v-66.666h119.334L586.667-326 634-373.333l139.334 139.334v-119.334H840V-120H606.667ZM326-586.667 186.666-726.001v119.334H120V-840h233.333v66.666H233.999L373.333-634 326-586.667Zm308 0L586.667-634l139.334-139.334H606.667V-840H840v233.333h-66.666v-119.334L634-586.667Z' />
        </svg>
      </label>
    </div>
  )
}

export default Map