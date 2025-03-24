function DirectFixPage() {
  return (
    <div>
      <h1>EMERGENCY LOCALSTORAGE FIX</h1>
      <p>Click the button below to clear all localStorage and fix your app:</p>
      <button
        onClick={() => {
          try {
            localStorage.clear();
            alert('SUCCESS: localStorage cleared. Now go to http://localhost:3003/landing');
          } catch (err) {
            alert('ERROR: ' + err);
          }
        }}
        style={{
          padding: '20px',
          fontSize: '20px',
          backgroundColor: 'red',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '5px'
        }}
      >
        CLEAR ALL DATA NOW
      </button>

      <div style={{ marginTop: '30px' }}>
        <h2>Manual Instructions:</h2>
        <ol>
          <li>Open Developer Tools (F12 or right-click → Inspect)</li>
          <li>Go to "Application" tab</li>
          <li>Select "Local Storage" on the left</li>
          <li>Right-click and select "Clear All"</li>
          <li>Then go to <a href="http://localhost:3003/landing">http://localhost:3003/landing</a></li>
        </ol>
      </div>
    </div>
  );
}

DirectFixPage.getInitialProps = () => {
  return {};
};

export default DirectFixPage; 