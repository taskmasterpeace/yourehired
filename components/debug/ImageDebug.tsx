import React from 'react';

/**
 * A component to debug image loading issues
 * This component attempts to load an image and reports success/failure
 */
export default function ImageDebug({ src, alt = "Debug image" }) {
  const [status, setStatus] = React.useState('loading');
  
  return (
    <div className="border p-4 my-4 rounded-md">
      <h3 className="font-bold mb-2">Image Debug: {src}</h3>
      <div className="mb-2">Status: <span className={status === 'loaded' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-yellow-600'}>{status}</span></div>
      <img 
        src={src} 
        alt={alt}
        className="max-w-full h-auto border"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
      <div className="mt-2 text-sm">
        <p>Full path: {typeof window !== 'undefined' ? `${window.location.origin}${src}` : src}</p>
        <p className="mt-1">If the image fails to load, check:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>The file exists in the public folder</li>
          <li>The path is correct (case-sensitive)</li>
          <li>The file format is supported by the browser</li>
        </ul>
      </div>
    </div>
  );
}
