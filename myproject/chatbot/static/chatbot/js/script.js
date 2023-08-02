document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const chatContainer = document.getElementById("chat-container");
  const chatLog = document.getElementById("chat-log");
  const userInput = document.getElementById("user-input");
  const scrollDownBtn = document.getElementById("scroll-down");
  const sendBtn = document.getElementById("send-btn");
  const loader = document.getElementById("loader");
  const imageSvg = document.getElementById("send-svg");

  // Constants and initial settings
  const placeholder = "Type your message...";
  const originalHeight = userInput.style.height;
  let isMessageBeingSent = false;
  let disabledCards = [];
  loader.hidden = true;

  // Utility functions

  // Function to create a DOM element with given class names
  function createDOMElement(elementType, classNames = []) {
    const element = document.createElement(elementType);
    element.classList.add(...classNames);
    return element;
  }

  // Function to format the timestamp for messages
  function formatTimestamp(date) {
    const options = {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: "Asia/Kolkata",
    };
    return date.toLocaleString("en-US", options);
  }

  // Function to scroll to the bottom of the chat log
  function scrollToBottom() {
    const scrollHeight = chatContainer.scrollHeight;
    const scrollTop = chatContainer.scrollTop;
    const heightDifference = scrollHeight - scrollTop;
    const duration = 500;
    let startTime = null;

    function animateScroll(timestamp) {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsedTime = timestamp - startTime;
      const scrollProgress = elapsedTime / duration;
      const distance = heightDifference * scrollProgress;
      chatContainer.scrollTop = scrollTop + distance;

      if (elapsedTime < duration) {
        requestAnimationFrame(animateScroll);
      } else {
        chatContainer.scrollTop = scrollHeight;
      }
    }
    requestAnimationFrame(animateScroll);
  }

  // Function to show the loading indicator
  function showLoader() {
    loader.hidden = false;
    sendBtn.disabled = true;
    imageSvg.hidden = true;
    createLoader();
  }

  // Function to hide the loading indicator
  function hideLoader() {
    loader.hidden = true;
    sendBtn.disabled = false;
    imageSvg.hidden = false;
    destroyLoader();
  }

  // Function to create the loading dots for the loader
  function createLoader() {
    const loaderDotsCount = 3;
    for (let i = 0; i < loaderDotsCount; i++) {
      const dot = createDOMElement("div");
      loader.appendChild(dot);
    }
  }

  // Function to destroy the loading dots when the loader is hidden
  function destroyLoader() {
    loader.innerHTML = "";
  }

  // Function to adjust the height of the textarea based on its content
  function adjustTextareaHeight() {
    userInput.style.height = "auto";
    userInput.style.height = userInput.scrollHeight + "px";

    const maxHeight = parseInt(window.getComputedStyle(userInput).getPropertyValue("max-height"));
    userInput.style.overflowY = userInput.scrollHeight > maxHeight ? "scroll" : "hidden";
  }

  // Function to handle user input change
  function handleInputChange() {
    sendBtn.disabled = userInput.value.trim() === "" || isMessageBeingSent || loader.hidden === false;
    adjustTextareaHeight();
  }

  // Function to handle user input key press (Enter key to send message)
  function handleKeyPress(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  }

  // Function to show the greeting message when the chat initializes
  function showGreetingMessage() {
    const greetingMessage = "Welcome to WellsCom. How can I assist you today?";

    const messageElement = createDOMElement("div", ["message", "bot-message", "greeting-message"]);

    const avatarElement = createDOMElement("div", ["avatar", "bot-avatar"]);
    messageElement.appendChild(avatarElement);

    const textElement = createDOMElement("div", ["text-wrapper"]);
    textElement.innerHTML = greetingMessage;
    messageElement.appendChild(textElement);

    const timestampElement = createDOMElement("div", ["timestamp", "bot-timestamp"]);
    const timestamp = formatTimestamp(new Date());
    timestampElement.innerText = timestamp;
    messageElement.appendChild(timestampElement);

    chatLog.appendChild(messageElement);
  }

  // async function showCardOptions() {
  //   const response = await fetch('/chatbot/bot-reply/'); // Assuming the endpoint for bot reply is '/chatbot/bot-reply/'
  //   const data = await response.json();
  
  //   if (data.bot_reply === "I'm sorry, I'm unable to understand. Please select from the given options.") {
  //     const parentCards = data.parent_data;
  //     parentCards.forEach((card) => {
  //       addCardMessage(card.content, `Here is your ${card.content.toLowerCase()}.`);
  //     });
  //   }
  // }
  async function showCardOptions(userInput) {
    const response = await fetch(`/chatbot/bot-reply/?user_input=${encodeURIComponent(userInput)}`);
    const data = await response.json();
  
    // if (data.bot_reply === "I'm sorry, I'm unable to understand. Please select from the given options.") {
    if (data.parent_data) {
      const parentCards = data.parent_data;
      parentCards.forEach((card) => {
        addCardMessage(card.content, `Here is your ${card.content.toLowerCase()}.`);
      });
    } else if (data.related_cards) {
      const relatedCards = data.related_cards;
      relatedCards.forEach((card) => {
        addCardMessage(card.content, `Related card: ${card.content}`);
      });
    }
  }
  
  // Function to add a card message to the chat log
  function addCardMessage(cardMessage, botReply) {
    const messageElement = createDOMElement("div", ["message", "bot-message", "card-message"]);
    messageElement.addEventListener("click", () => {
      handleCardClick(botReply, messageElement);
    });

    const textElement = createDOMElement("div", ["text-wrapper"]);
    textElement.innerHTML = cardMessage;
    messageElement.appendChild(textElement);

    chatLog.appendChild(messageElement);
  }

  // Function to handle card click
  async function handleCardClick(botReply, clickedMessage) {
    if (disabledCards.includes(clickedMessage)) {
      return;
    }

    const cardMessages = Array.from(chatLog.getElementsByClassName("message"));
    const isActiveCard = clickedMessage.classList.toggle("active-card");

    if (isActiveCard) {
      // Hide other card messages
      cardMessages.forEach((message) => {
        if (message !== clickedMessage && message.classList.contains("card-message")) {
          message.style.display = "none";
        }
      });

      // Move the clicked card to the bottom
      chatLog.appendChild(clickedMessage);

      // Disable click event on all card messages
      cardMessages.forEach((message) => {
        message.style.pointerEvents = "none";
      });

      clickedMessage.classList.remove("bot-message", "card-message");
      clickedMessage.classList.add("user-message"); // Apply "user-message" class to the clicked card

      const userTimestampElement = createDOMElement("div", ["timestamp", "user-timestamp"]);
      const timestamp = formatTimestamp(new Date());
      userTimestampElement.innerText = timestamp;
      clickedMessage.appendChild(userTimestampElement);

      const userAvatarElement = createDOMElement("div", ["avatar", "user-avatar"]);
      clickedMessage.appendChild(userAvatarElement);

      scrollToBottom(); // Scroll to bottom before bot response

      showLoader(); // Show the loader while waiting for the bot response

      // Add bot reply just below the card message after a time gap of 1 second
      if (botReply) {
        const botReplyMessage = createDOMElement("div", ["message", "bot-message"]);
        const botAvatarElement = createDOMElement("div", ["avatar", "bot-avatar"]);
        botReplyMessage.appendChild(botAvatarElement);

        const botTextElement = createDOMElement("div", ["text-wrapper"]);
        botTextElement.innerHTML = botReply;
        botReplyMessage.appendChild(botTextElement);

        const botTimestampElement = createDOMElement("div", ["timestamp", "bot-timestamp"]);
        const botTimestamp = formatTimestamp(new Date());
        botTimestampElement.innerText = botTimestamp;
        botReplyMessage.appendChild(botTimestampElement);

        // Wait for a time gap of 1 second before appending the bot reply
        await new Promise((resolve) => setTimeout(resolve, 1000));
        chatLog.appendChild(botReplyMessage);
      }

      hideLoader(); // Hide the loader after bot response

      disabledCards.push(clickedMessage);
    } else {
      // Show all card messages again
      cardMessages.forEach((message) => {
        if (message.classList.contains("card-message")) {
          message.style.display = "block";
        }
      });

      clickedMessage.classList.remove("user-message"); // Remove "user-message" class when the card is deselected
      clickedMessage.classList.add("bot-message", "card-message");

      clickedMessage.removeChild(clickedMessage.lastChild);
      // Move the bot reply to the bottom
      const botReplyMessage = clickedMessage.nextSibling;
      if (botReplyMessage) {
        chatLog.removeChild(botReplyMessage);
      }

      // Re-enable click event on all card messages
      cardMessages.forEach((message) => {
        message.style.pointerEvents = "auto";
      });

      // Remove the clicked message from the disabled cards list
      const index = disabledCards.indexOf(clickedMessage);
      if (index !== -1) {
        disabledCards.splice(index, 1);
      }
    }

    scrollToBottom(); // Scroll to bottom after bot response (if any)
    sendBtn.disabled =
      userInput.value.trim() === "" ||
      isMessageBeingSent ||
      chatLog.getElementsByClassName("active-card").length > 0 ||
      loader.hidden === false;
  }

  // Function to add a message to the chat log
  function addMessage(message, isUser) {
    const messageElement = createDOMElement("div", ["message", isUser ? "user-message" : "bot-message"]);

    const avatarElement = createDOMElement("div", ["avatar", isUser ? "user-avatar" : "bot-avatar"]);
    messageElement.appendChild(avatarElement);

    const textElement = createDOMElement("div", ["text-wrapper"]);
    textElement.innerHTML = message;
    messageElement.appendChild(textElement);

    const timestampElement = createDOMElement("div", ["timestamp", isUser ? "user-timestamp" : "bot-timestamp"]);
    const timestamp = formatTimestamp(new Date());
    timestampElement.innerText = timestamp;
    messageElement.appendChild(timestampElement);

    chatLog.appendChild(messageElement);
  }

  // Function to generate bot reply
  async function generateBotReply(userInput) {
    try {
      const response = await fetch(`/chatbot/bot-reply/?user_input=${encodeURIComponent(userInput)}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.bot_reply;
    } catch (error) {
      console.error("Error fetching bot reply:", error);
      return "Error fetching bot reply.";
    }
  }

  // Function to send a message
  async function sendMessage() {
    if (isMessageBeingSent) return;

    isMessageBeingSent = true;
    userInput.removeEventListener("keypress", handleKeyPress);
    sendBtn.disabled = true;
    const message = userInput.value.trim();

    if (message !== "") {
      addMessage(message, true);
      userInput.value = "";
      userInput.style.height = originalHeight;
      showLoader();
      scrollToBottom();

      const botReply = await generateBotReply(message);
      if (botReply) {
        addMessage(botReply, false);
        if (botReply.includes("I'm sorry, I'm unable to understand. Please select from the given options.")) {
          showCardOptions(); // Show card options only when the bot response contains the trigger text
        }
        hideLoader();
      }

      scrollToBottom();
    } else {
      userInput.placeholder = placeholder;
    }

    sendBtn.disabled = userInput.value.trim() === "" || isMessageBeingSent || loader.hidden === false;
    userInput.addEventListener("keypress", handleKeyPress);
    isMessageBeingSent = false;
  }

  // Function to initialize event listeners
  function initEventListeners() {
    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", handleKeyPress);
    userInput.addEventListener("input", handleInputChange);
    scrollDownBtn.addEventListener("click", scrollToBottom);
  }

  // Function to initialize the user input
  function initUserInput() {
    userInput.placeholder = placeholder;
    userInput.style.height = originalHeight;
  }

  // Function to initialize the chat
  function initializeChat() {
    initEventListeners();
    initUserInput();
    showGreetingMessage();
    // showCardOptions();
  }
  // Initialize the chat
  initializeChat();
  
});