import React from 'react';
import './RichTextEditor.css'; // Reuse the rich text styles

const RichTextDisplay = ({ content, className = '' }) => {
  // Sanitize the HTML content for safe display
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  return (
    <div 
      className={`rich-text-display ${className}`}
      dangerouslySetInnerHTML={createMarkup(content)}
    />
  );
};

export default RichTextDisplay;