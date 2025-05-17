import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaExclamationTriangle } from 'react-icons/fa';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  
  useEffect(() => {
    // Check if browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Your browser does not support speech recognition.');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    recognitionRef.current.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    return () => {
      // Clean up
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    setError('');
    setTranscript('');

    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
    } else {
      setError('Speech recognition is not available');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);

      if (transcript) {
        onResult(transcript);
      }
    }
  };

  return (
    <div className="voice-recorder">
      <div className="recorder-controls">
        <h3>Voice Recording</h3>
        {error && (
          <div className="recorder-error">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}
        <div className="recorder-buttons">
          {!isRecording ? (
            <button 
              onClick={startRecording} 
              disabled={!!error} 
              className="start-button"
              title="Start recording"
            >
              <FaMicrophone /> Start Recording
            </button>
          ) : (
            <button 
              onClick={stopRecording} 
              className="stop-button"
              title="Stop recording"
            >
              <FaStop /> Stop Recording
            </button>
          )}
        </div>
      </div>

      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-dot"></div>
          <span>Recording...</span>
        </div>
      )}
      
      {transcript && (
        <div className="transcript-preview">
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
