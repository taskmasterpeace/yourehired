export default function ClearPage() {
  return (
    <html>
      <head>
        <title>Clear LocalStorage</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .card {
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            background-color: white;
          }
          h1 {
            color: #333;
          }
          .button {
            background-color: #ff0000;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 4px;
            margin-bottom: 10px;
            width: 100%;
          }
          .success {
            background-color: #e6ffe6;
            border: 1px solid #ccffcc;
            padding: 10px;
            border-radius: 4px;
            color: #006600;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div className="card">
          <h1>Clear LocalStorage Data</h1>
          <p>Click the button below to clear all data and fix the application:</p>
          
          <button className="button" onClick={clearStorage}>
            CLEAR ALL DATA
          </button>
          
          <div id="message"></div>
          
          <p>After clearing data, go to: <a href="/landing">/landing</a></p>
        </div>
        
        <script dangerouslySetInnerHTML={{ __html: `
          function clearStorage() {
            try {
              localStorage.clear();
              document.getElementById("message").innerHTML = '<div class="success">SUCCESS: All data cleared! You can now go to <a href="/landing">/landing</a></div>';
            } catch(e) {
              document.getElementById("message").innerHTML = '<div style="color: red;">Error: ' + e.message + '</div>';
            }
          }
        `}} />
      </body>
    </html>
  );
} 