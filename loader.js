// Import map for modules that will be loaded from CDN
const importMap = {
  imports: {
    "preact": "https://esm.sh/preact@10.19.2",
    "preact/hooks": "https://esm.sh/preact@10.19.2/hooks",
    "preact/jsx-runtime": "https://esm.sh/preact@10.19.2/jsx-runtime"
  }
};

// Register the import map
const script = document.createElement('script');
script.type = 'importmap';
script.textContent = JSON.stringify(importMap);
document.head.appendChild(script);

// Load the main script
document.addEventListener('DOMContentLoaded', () => {
  import('./index.js')
    .catch(error => {
      console.error('Failed to load application:', error);
      document.getElementById('app').innerHTML = `
        <div style="color: red; padding: 2rem;">
          <h2>Error Loading Application</h2>
          <p>${error.message}</p>
          <p>Check the console for more details.</p>
        </div>
      `;
    });
});
