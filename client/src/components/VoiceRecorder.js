import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onResult, isNoteSelected, onAppendResult }) => {
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
      // Reset the onend handler to default behavior for creating a new note
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current.start();
      setIsRecording(true);
    } else {
      setError('Speech recognition is not available');
    }
  };const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);

      // Always create a new note when stopping recording unless we're in append mode
      if (transcript) {
        // Create new note if this recording was started with the startRecording function
        onResult(transcript);
      }
    }
  };return (
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
            <>
              <button 
                onClick={startRecording} 
                disabled={!!error} 
                className="start-button"
                title="Start new recording"
              >
                <FaMicrophone /> {isNoteSelected ? "Record New" : "Start Recording"}
              </button>              {isNoteSelected && (
                <button 
                  onClick={() => {
                    setError('');
                    setTranscript('');
                    
                    if (recognitionRef.current) {
                      // Store the current transcript temporarily to be used in the onend handler
                      let appendTranscript = '';
                      
                      // Override the onresult handler to capture new content
                      const originalOnResult = recognitionRef.current.onresult;
                      recognitionRef.current.onresult = (event) => {
                        let currentTranscript = '';
                        for (let i = 0; i < event.results.length; i++) {
                          currentTranscript += event.results[i][0].transcript;
                        }
                        appendTranscript = currentTranscript;
                        setTranscript(currentTranscript);
                      };
                      
                      recognitionRef.current.onend = () => {
                        // Restore original handler
                        recognitionRef.current.onresult = originalOnResult;
                        
                        if (appendTranscript) {
                          onAppendResult(appendTranscript);
                        }
                        setIsRecording(false);
                      };
                      recognitionRef.current.start();
                      setIsRecording(true);
                    } else {
                      setError('Speech recognition is not available');
                    }
                  }}
                  disabled={!!error} 
                  className="append-button"
                  title="Append to selected note"
                >
                  <FaPlus /> Append to Note
                </button>
              )}
            </>
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
