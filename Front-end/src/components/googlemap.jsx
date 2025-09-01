import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

const MyMap = () => (
  <APIProvider apiKey="AIzaSyA8MZVEtCVJrzAQe7JV08UVeNDLMpQDuxA">
    <Map
      center={{ lat: 40.7128, lng: -74.0060 }}
      zoom={12}
      style={{ height: '400px' }}
    >
      <Marker position={{ lat: 40.7128, lng: -74.0060 }} />
    </Map>
  </APIProvider>
);