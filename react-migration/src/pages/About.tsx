export default function About() {
  return (
    <div style={{ width: '100%' }}>
      <h1>About this app</h1>
      
      <p>
        This is a React app for controlling SmartHat matrix LED displays via Bluetooth.
        You can make your own by following the SvelteKit to React migration guide.
      </p>

      <h2>Features</h2>
      <ul>
        <li>BLE connection management</li>
        <li>Visual effects: Text, Equalizer, Matrix patterns</li>
        <li>PWA with offline support</li>
      </ul>
    </div>
  );
}
