import React from 'react';
import {
  Message,
  MessageSender,
  MessageType,
  TextContent,
  ImageAnalysisContent,
} from '../types';

interface MessageDisplayProps {
  message: Message;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.User;
  const messageClass = isUser
    ? 'bg-blue-500 text-white self-end rounded-br-none'
    : 'bg-white text-gray-800 self-start rounded-bl-none shadow-sm';

  const formattedTimestamp = message.timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex flex-col p-3 max-w-[80%] rounded-lg break-words whitespace-pre-wrap ${messageClass}`}
    >
      {message.type === MessageType.Text ||
      message.type === MessageType.GrammarCorrection ? (
        <p>{(message.content as TextContent).text}</p>
      ) : message.type === MessageType.ImageAnalysis ? (
        <div className="w-full">
          {/* Soulingo'nun Analizi başlığını sadece ilk nesne varsa göster */}
          {(message.content as ImageAnalysisContent).identifiedObjects.length > 0 && (
            <h2 className="text-xl font-semibold mb-3">Soulingo'nun Analizi:</h2>
          )}
          {(message.content as ImageAnalysisContent).identifiedObjects.map((obj, index) => (
            <div key={index} className="bg-gray-50 text-gray-800 p-3 rounded-md border border-gray-100 mb-2 last:mb-0 text-left">
              <p className="text-blue-700 font-bold mb-1">
                {obj.english} <span className="text-gray-600">(Türkçesi: {obj.turkish})</span>
              </p>
              <p className="italic text-gray-800">Example: '{obj.sentence}'</p>
            </div>
          ))}
        </div>
      ) : null}
      <span
        className={`mt-1 text-xs ${
          isUser ? 'text-blue-100' : 'text-gray-500'
        } ${isUser ? 'text-right' : 'text-left'}`}
      >
        {formattedTimestamp}
      </span>
    </div>
  );
};

export default MessageDisplay;