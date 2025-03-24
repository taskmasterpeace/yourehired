import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function EmergencyFixPage() {
  const [message, setMessage] = useState('');
  const [storageInfo, setStorageInfo] = useState('');
  
  // Get localStorage info on page load
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Estimate localStorage size
        let totalSize = 0;
        let items = {};
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i) || '';
          const value = localStorage.getItem(key) || '';
          const size = (key.length + value.length) * 2; // UTF-16 encoding uses 2 bytes per character
          totalSize += size;
          items[key] = size;
        }
        
        // Format info
        let infoText = `Total localStorage usage: ${(totalSize / 1024).toFixed(2)} KB\n\n`;
        infoText += 'Individual items:\n';
        
        Object.entries(items).forEach(([key, size]) => {
          infoText += `${key}: ${(size / 1024).toFixed(2)} KB\n`;
        });
        
        setStorageInfo(infoText);
      }
    } catch (error) {
      setStorageInfo('Error getting localStorage info: ' + error.message);
    }
  }, []);
  
  const clearAllLocalStorage = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        setMessage('SUCCESS: All localStorage data has been completely cleared. Reload the app to start fresh.');
        setStorageInfo('Total localStorage usage: 0 KB');
      }
    } catch (error) {
      setMessage('ERROR: Failed to clear localStorage: ' + error.message);
    }
  };
  
  const clearAppState = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('captainAppState');
        localStorage.removeItem('captainAppStateEmergency');
        setMessage('SUCCESS: App state data has been cleared. Other settings remain intact.');
        
        // Update storage info
        const totalSize = [...Array(localStorage.length)].reduce((acc, _, i) => {
          const key = localStorage.key(i) || '';
          const value = localStorage.getItem(key) || '';
          return acc + (key.length + value.length) * 2;
        }, 0);
        
        setStorageInfo(`Total localStorage usage: ${(totalSize / 1024).toFixed(2)} KB\n\nItems deleted: captainAppState, captainAppStateEmergency`);
      }
    } catch (error) {
      setMessage('ERROR: Failed to clear app state: ' + error.message);
    }
  };
  
  // Basic styling inline to avoid any external dependencies
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    card: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    header: {
      borderBottom: '1px solid #eee',
      paddingBottom: '10px',
      marginBottom: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0 0 10px 0'
    },
    warning: {
      backgroundColor: '#FFEBEE',
      border: '1px solid #FFCDD2',
      borderRadius: '4px',
      padding: '15px',
      marginBottom: '20px'
    },
    warningTitle: {
      color: '#B71C1C',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    warningText: {
      color: '#C62828'
    },
    button: {
      backgroundColor: '#F44336',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '12px 20px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      width: '100%',
      marginBottom: '10px'
    },
    successMessage: {
      backgroundColor: '#E8F5E9', 
      border: '1px solid #C8E6C9', 
      color: '#2E7D32',
      padding: '15px',
      borderRadius: '4px',
      marginTop: '15px'
    },
    errorMessage: {
      backgroundColor: '#FFEBEE', 
      border: '1px solid #FFCDD2', 
      color: '#B71C1C',
      padding: '15px',
      borderRadius: '4px',
      marginTop: '15px'
    },
    pre: {
      backgroundColor: '#f5f5f5',
      padding: '15px',
      borderRadius: '4px',
      overflow: 'auto',
      maxHeight: '300px',
      fontSize: '12px',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word'
    }
  };
  
  return (
    <div style={styles.container}>
      <Head>
        <title>CAPTAIN - Emergency Fix</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>EMERGENCY REPAIR: Clear LocalStorage</h1>
        </div>
        
        <div style={styles.warning}>
          <p style={styles.warningTitle}>⚠️ WARNING:</p>
          <p style={styles.warningText}>
            This is an emergency tool to fix localStorage quota errors. Using these buttons will 
            delete your local data. Only use this if your application is crashing with 
            "QuotaExceededError" messages.
          </p>
        </div>
        
        <div>
          <button 
            style={styles.button}
            onClick={clearAppState}
          >
            Clear App Data Only (Recommended)
          </button>
          
          <button 
            style={styles.button}
            onClick={clearAllLocalStorage}
          >
            Clear ALL LocalStorage Data (Nuclear Option)
          </button>
          
          {message && (
            <div style={message.startsWith('SUCCESS') ? styles.successMessage : styles.errorMessage}>
              {message}
            </div>
          )}
        </div>
      </div>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>LocalStorage Information</h2>
        </div>
        <pre style={styles.pre}>
          {storageInfo}
        </pre>
      </div>
    </div>
  );
} 