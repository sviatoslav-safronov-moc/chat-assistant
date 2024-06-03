import React, { useState, useEffect } from 'react';
import './App.css';
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hi there, and welcome to Master of Code Global! 👋I'm your virtual assistant, here to help you answer questions about MOCG, navigate this website, and more. How can I help you today?",
      sentTime: "just now",
      sender: "Bot",
      direction: 'incoming'
    }
  ]);
  const [input, setInput] = useState('');
  let [thread, setThread] = useState(null);

  const sendMessage = () => {
    setMessages(prevMessages => [...prevMessages, {message: input, sentTime: "just now", sender: 'You'}])
    setInput('');
    console.log(messages)
    fetch('/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input, thread: thread }),
    })
      .then(response => response.json())
      .then(data => {
        if (!thread) { setThread(data.thread) }

        setMessages(prevMessages => [...prevMessages, {message: data.message, sentTime: "just now", sender: 'Bot', direction: 'incoming'}])
      })
      .catch(console.error);
  };

  return (
    <div style={{ position: "relative", height: "500px" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {messages.map((msg, index) => (
              <Message
                key={index}
                model={msg}
              />
            ))}
          </MessageList>
          <MessageInput 
            placeholder="Type message here" 
            value={input} 
            onChange={(val) => setInput(val)} 
            onSend={sendMessage}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default App;