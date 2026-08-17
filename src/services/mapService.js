// Google Maps script loader service
let googleMapsPromise = null;

export const mapService = {
  loadGoogleMaps(apiKey) {
    if (window.google?.maps) return Promise.resolve(window.google.maps);
    
    if (!googleMapsPromise) {
      googleMapsPromise = new Promise((resolve, reject) => {
        const existing = document.getElementById('google-maps-script');
        if (existing) {
          existing.addEventListener('load', () => resolve(window.google.maps));
          existing.addEventListener('error', reject);
          return;
        }
        
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return googleMapsPromise;
  }
};
