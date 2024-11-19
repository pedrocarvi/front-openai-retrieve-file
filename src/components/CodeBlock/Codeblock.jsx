import React, { useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; 

const CodeBlock = ({ code, language }) => {
  useEffect(() => {
    hljs.highlightAll();
  }, []);

  return (
    <pre style={{fontSize: '12px', borderRadius: '12px'}}>
      <code className={language} style={{borderRadius: '12px'}}>
        {code}
      </code>
    </pre>
  );
};

export default CodeBlock;
