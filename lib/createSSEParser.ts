import {
    SSE_DONE_MESSAGE,
    StreamMessageType,
    SSE_DATA_PREFIX,
    StreamMessage,
  } from "./types";
  
  /**
   * Creates a parser for Server-Sent Events (SSE) streams.
   * SSE allows real-time updates from the server to the client.
   */
  export const createSSEParser = () => {
    let buffer = "";
  
    const parse = (chunk: string): StreamMessage[] => {
      // Combine the buffer with the new chunk and split it into lines
      const lines = (buffer + chunk).split("\n");
  
      // Save the last potentially incomplete line
      buffer = lines.pop() || "";
  
      return lines
        .map((line) => {
          // Trim whitespace from the line
          const trimmed = line.trim();
  
          // Ignore empty lines and lines that do not start with the expected prefix
          if (!trimmed || !trimmed.startsWith(SSE_DATA_PREFIX)) return null;
  
          // Extract the actual data from the SSE message
          const data = trimmed.substring(SSE_DATA_PREFIX.length);
  
          // Check if the message is a "Done" signal
          if (data === SSE_DONE_MESSAGE) return { type: StreamMessageType.Done };
  
          try {
            // Parse the message as JSON
            const parsed = JSON.parse(data) as StreamMessage;
  
            // Validate the parsed message type
            return Object.values(StreamMessageType).includes(parsed.type)
              ? parsed
              : null;
          } catch {
            // Return an error message if parsing fails
            return {
              type: StreamMessageType.Error,
              error: "Failed to parse SSE message",
            };
          }
        })
        // Filter out null values (invalid messages)
        .filter((msg): msg is StreamMessage => msg !== null);
    };
  
    return { parse };
  };
  