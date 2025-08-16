import { useMessageStore } from '../messageStore';

describe('MessageStore', () => {
  beforeEach(() => {
    // Clear message history before each test
    useMessageStore.getState().clearHistory();
  });

  describe('CRUD operations', () => {
    it('should add a message', () => {
      const { addMessage, getMessageCount } = useMessageStore.getState();
      
      addMessage({
        role: 'user',
        text: 'Hello Doraemon',
      });
      
      expect(getMessageCount()).toBe(1);
      
      const messages = useMessageStore.getState().messages;
      expect(messages[0].role).toBe('user');
      expect(messages[0].text).toBe('Hello Doraemon');
      expect(messages[0].id).toBeDefined();
      expect(messages[0].createdAt).toBeDefined();
    });

    it('should add a message with metadata', () => {
      const { addMessage } = useMessageStore.getState();
      const metadata = { confidence: 0.95, processingTime: 150 };
      
      addMessage({
        role: 'assistant',
        text: 'Hello there!',
        metadata,
      });
      
      const messages = useMessageStore.getState().messages;
      expect(messages[0].metadata).toEqual(metadata);
    });

    it('should update a message', () => {
      const { addMessage, updateMessage } = useMessageStore.getState();
      
      addMessage({
        role: 'user',
        text: 'Original text',
      });
      
      const messageId = useMessageStore.getState().messages[0].id;
      
      updateMessage(messageId, {
        text: 'Updated text',
        status: 'sent',
      });
      
      const updatedMessage = useMessageStore.getState().messages[0];
      expect(updatedMessage.text).toBe('Updated text');
      expect(updatedMessage.status).toBe('sent');
    });

    it('should delete a message', () => {
      const { addMessage, deleteMessage, getMessageCount } = useMessageStore.getState();
      
      addMessage({ role: 'user', text: 'Test message' });
      const messageId = useMessageStore.getState().messages[0].id;
      
      deleteMessage(messageId);
      
      expect(getMessageCount()).toBe(0);
    });

    it('should clear history', () => {
      const { addMessage, clearHistory, getMessageCount } = useMessageStore.getState();
      
      addMessage({ role: 'user', text: 'Message 1' });
      addMessage({ role: 'assistant', text: 'Message 2' });
      
      expect(getMessageCount()).toBe(2);
      
      clearHistory();
      
      expect(getMessageCount()).toBe(0);
    });
  });

  describe('Query operations', () => {
    beforeEach(() => {
      const { addMessage } = useMessageStore.getState();
      
      addMessage({ role: 'user', text: 'User message 1' });
      addMessage({ role: 'assistant', text: 'Assistant message 1' });
      addMessage({ role: 'user', text: 'User message 2' });
    });

    it('should get message by id', () => {
      const { getMessageById } = useMessageStore.getState();
      const messageId = useMessageStore.getState().messages[0].id;
      
      const message = getMessageById(messageId);
      
      expect(message).toBeDefined();
      expect(message?.text).toBe('User message 1');
    });

    it('should get messages by role', () => {
      const { getMessagesByRole } = useMessageStore.getState();
      
      const userMessages = getMessagesByRole('user');
      const assistantMessages = getMessagesByRole('assistant');
      
      expect(userMessages).toHaveLength(2);
      expect(assistantMessages).toHaveLength(1);
      expect(userMessages[0].text).toBe('User message 1');
      expect(assistantMessages[0].text).toBe('Assistant message 1');
    });

    it('should get recent messages', () => {
      const { getRecentMessages } = useMessageStore.getState();
      
      const recentMessages = getRecentMessages(2);
      
      expect(recentMessages).toHaveLength(2);
      expect(recentMessages[0].text).toBe('Assistant message 1');
      expect(recentMessages[1].text).toBe('User message 2');
    });
  });

  describe('Utility operations', () => {
    it('should get message count', () => {
      const { addMessage, getMessageCount } = useMessageStore.getState();
      
      expect(getMessageCount()).toBe(0);
      
      addMessage({ role: 'user', text: 'Test' });
      expect(getMessageCount()).toBe(1);
    });

    it('should get last message', () => {
      const { addMessage, getLastMessage } = useMessageStore.getState();
      
      expect(getLastMessage()).toBeUndefined();
      
      addMessage({ role: 'user', text: 'First message' });
      addMessage({ role: 'assistant', text: 'Last message' });
      
      const lastMessage = getLastMessage();
      expect(lastMessage?.text).toBe('Last message');
    });

    it('should check if has messages', () => {
      const { addMessage, hasMessages } = useMessageStore.getState();
      
      expect(hasMessages()).toBe(false);
      
      addMessage({ role: 'user', text: 'Test' });
      expect(hasMessages()).toBe(true);
    });
  });

  describe('Streaming operations', () => {
    it('should start streaming message', () => {
      const { startStreamingMessage, getMessageById } = useMessageStore.getState();
      
      const messageId = startStreamingMessage('assistant', 'Hello');
      const message = getMessageById(messageId);
      
      expect(message).toBeDefined();
      expect(message?.text).toBe('Hello');
      expect(message?.status).toBe('sending');
      expect(message?.role).toBe('assistant');
    });

    it('should update streaming message', () => {
      const { startStreamingMessage, updateStreamingMessage, getMessageById } = useMessageStore.getState();
      
      const messageId = startStreamingMessage('assistant', 'Hello');
      updateStreamingMessage(messageId, ' there');
      updateStreamingMessage(messageId, '!');
      
      const message = getMessageById(messageId);
      expect(message?.text).toBe('Hello there!');
    });

    it('should complete streaming message', () => {
      const { startStreamingMessage, completeStreamingMessage, getMessageById } = useMessageStore.getState();
      
      const messageId = startStreamingMessage('assistant', 'Complete message');
      completeStreamingMessage(messageId);
      
      const message = getMessageById(messageId);
      expect(message?.status).toBe('sent');
    });
  });
});