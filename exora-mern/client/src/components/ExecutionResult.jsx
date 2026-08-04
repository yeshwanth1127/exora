// client/src/components/ExecutionResult.jsx

import React, { useState } from 'react';
import './ExecutionResult.css';

/**
 * Execution Result Component
 * Displays workflow execution results with smart formatting
 */
function ExecutionResult({ result, onClose, onRunAgain }) {
  const [showRawData, setShowRawData] = useState(false);

  if (!result) return null;

  const { success, status, output, error, durationMs, executionId, logs } = result;

  // Smart output parsing
  const parsedOutput = parseOutput(output);

  return (
    <div className="execution-result">
      {/* Status Header */}
      <div className={`result-header ${status}`}>
        <div className="status-icon">
          {status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳'}
        </div>
        <div className="status-details">
          <h3 className="status-title">
            {status === 'success' ? 'Execution Successful!' : 
             status === 'error' ? 'Execution Failed' : 
             'Execution in Progress...'}
          </h3>
          {durationMs !== undefined && (
            <p className="execution-time">
              Completed in {(durationMs / 1000).toFixed(2)}s
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-section">
          <h4>Error Details:</h4>
          <pre className="error-message">{error}</pre>
        </div>
      )}

      {/* Formatted Output */}
      {status === 'success' && parsedOutput && (
        <div className="output-section">
          <h4>Results:</h4>
          
          {parsedOutput.type === 'document' && (
            <div className="output-card">
              <div className="output-icon">📄</div>
              <div className="output-details">
                <div className="output-title">Document Created</div>
                {parsedOutput.data.documentId && (
                  <div className="output-field">
                    <span className="field-name">ID:</span>
                    <code>{parsedOutput.data.documentId}</code>
                  </div>
                )}
                {parsedOutput.data.url && (
                  <a 
                    href={parsedOutput.data.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="output-link"
                  >
                    Open Document →
                  </a>
                )}
              </div>
            </div>
          )}

          {parsedOutput.type === 'spreadsheet' && (
            <div className="output-card">
              <div className="output-icon">📊</div>
              <div className="output-details">
                <div className="output-title">Spreadsheet Updated</div>
                {parsedOutput.data.spreadsheetId && (
                  <div className="output-field">
                    <span className="field-name">ID:</span>
                    <code>{parsedOutput.data.spreadsheetId}</code>
                  </div>
                )}
                {parsedOutput.data.updatedRows && (
                  <div className="output-field">
                    <span className="field-name">Rows Updated:</span>
                    <span>{parsedOutput.data.updatedRows}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {parsedOutput.type === 'email' && (
            <div className="output-card">
              <div className="output-icon">📧</div>
              <div className="output-details">
                <div className="output-title">Email Sent</div>
                {parsedOutput.data.messageId && (
                  <div className="output-field">
                    <span className="field-name">Message ID:</span>
                    <code>{parsedOutput.data.messageId}</code>
                  </div>
                )}
              </div>
            </div>
          )}

          {parsedOutput.type === 'generic' && (
            <div className="output-card">
              <div className="output-icon">✨</div>
              <div className="output-details">
                <div className="output-title">Execution Complete</div>
                <div className="output-summary">
                  {Object.keys(parsedOutput.data).length} fields in output
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Execution Logs */}
      {logs && logs.length > 0 && (
        <div className="logs-section">
          <h4>Execution Logs:</h4>
          <div className="logs-list">
            {logs.map((log, idx) => (
              <div key={idx} className={`log-item ${log.status}`}>
                <span className="log-icon">
                  {log.status === 'success' ? '✓' : '✗'}
                </span>
                <span className="log-node">{log.node}</span>
                {log.error && (
                  <span className="log-error">{log.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Data Toggle */}
      <div className="raw-data-section">
        <button 
          className="toggle-raw-button"
          onClick={() => setShowRawData(!showRawData)}
        >
          {showRawData ? '▼' : '▶'} View Raw Output
        </button>
        
        {showRawData && (
          <pre className="raw-data">
            {JSON.stringify(output, null, 2)}
          </pre>
        )}
      </div>

      {/* Action Buttons */}
      <div className="result-actions">
        {status === 'success' && onRunAgain && (
          <button className="action-button secondary" onClick={onRunAgain}>
            🔄 Run Again
          </button>
        )}
        <button className="action-button primary" onClick={onClose}>
          {status === 'success' ? 'Done' : 'Close'}
        </button>
      </div>

      {/* Execution Metadata */}
      {executionId && (
        <div className="result-footer">
          <small>Execution ID: {executionId}</small>
        </div>
      )}
    </div>
  );
}

/**
 * Parse output and detect type for smart formatting
 * @private
 */
function parseOutput(output) {
  if (!output) return null;

  // Try to detect output type from data structure
  const data = output.data?.[0]?.json || output[0]?.json || output;

  // Google Docs output
  if (data?.documentId || data?.document?.documentId) {
    return {
      type: 'document',
      data: {
        documentId: data.documentId || data.document?.documentId,
        url: data.url || data.document?.url
      }
    };
  }

  // Google Sheets output
  if (data?.spreadsheetId || data?.updatedRows) {
    return {
      type: 'spreadsheet',
      data: {
        spreadsheetId: data.spreadsheetId,
        updatedRows: data.updatedRows || data.updates?.updatedRows
      }
    };
  }

  // Gmail output
  if (data?.messageId || data?.id) {
    return {
      type: 'email',
      data: {
        messageId: data.messageId || data.id,
        threadId: data.threadId
      }
    };
  }

  // Generic output
  return {
    type: 'generic',
    data: data
  };
}

export default ExecutionResult;


