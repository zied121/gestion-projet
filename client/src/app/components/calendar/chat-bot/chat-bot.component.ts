// chat-bot.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BotEventService } from '../../../services/botEvent.service';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot.component.html',
  styles: [`
    @keyframes slide-up {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    .animate-slide-up {
      animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 4px;
    }
    
    ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 10px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
    
    /* Textarea auto-resize */
    textarea {
      field-sizing: content;
    }
  `]
})
export class ChatBotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  isOpen = false;
  messages: ChatMessage[] = [];
  currentMessage = '';
  isLoading = false;
  hasNewMessage = false;

  quickSuggestions = [
    "How many meetings do I have today?",
    "What's my next event?",
    "When is the next holiday?",
    "Show me this week's schedule",
    "Any upcoming deadlines?",
    "Who responded to my last meeting?"
  ];

  constructor(private botService: BotEventService) {}

  ngOnInit(): void {
    // Load saved messages from localStorage
    this.loadSavedMessages();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.hasNewMessage = false;
      setTimeout(() => {
        this.messageInput?.nativeElement?.focus();
      }, 300);
    }
  }

  sendMessage(): void {
    if (!this.canSendMessage()) return;

    const userMessage: ChatMessage = {
      id: this.generateId(),
      content: this.currentMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const query = this.currentMessage.trim();
    this.currentMessage = '';
    this.isLoading = true;

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: this.generateId(),
      content: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };
    this.messages.push(typingMessage);

    this.botService.sendBotQuery(query).subscribe({
      next: (response) => {
        // Remove typing indicator
        this.messages = this.messages.filter(m => !m.isTyping);
        
        // Add AI response
        const aiMessage: ChatMessage = {
          id: this.generateId(),
          content: response.data.message || 'Sorry, I couldn\'t process your request.',
          isUser: false,
          timestamp: new Date()
        };
        
        this.messages.push(aiMessage);
        this.isLoading = false;
        
        // Show notification if chat is closed
        if (!this.isOpen) {
          this.hasNewMessage = true;
        }
        
        this.saveMessages();
      },
      error: (error) => {
        console.error('Chat error:', error);
        
        // Remove typing indicator
        this.messages = this.messages.filter(m => !m.isTyping);
        
        // Add error message
        const errorMessage: ChatMessage = {
          id: this.generateId(),
          content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
          isUser: false,
          timestamp: new Date()
        };
        
        this.messages.push(errorMessage);
        this.isLoading = false;
        this.saveMessages();
      }
    });
  }

  sendQuickMessage(suggestion: string): void {
    this.currentMessage = suggestion;
    this.sendMessage();
  }

  handleKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
  }

  canSendMessage(): boolean {
    return this.currentMessage.trim().length > 0 && 
           this.currentMessage.length <= 500 && 
           !this.isLoading;
  }

  clearChat(): void {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.messages = [];
      localStorage.removeItem('chatMessages');
    }
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }

  trackMessage(index: number, message: ChatMessage): string {
    return message.id;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveMessages(): void {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  private loadSavedMessages(): void {
    try {
      const saved = localStorage.getItem('chatMessages');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.messages = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading saved messages:', error);
      this.messages = [];
    }
  }
}