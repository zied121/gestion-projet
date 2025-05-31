import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;
  readonly uri: string = 'http://localhost:5000'; // Change if needed

  constructor() {
    this.socket = io(this.uri);
  }

  // Emit an event with optional data
  emit(eventName: string, data?: any) {
    this.socket.emit(eventName, data);
  }

  // Listen to an event and return it as an Observable
  listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });

      // Cleanup when unsubscribed
      return () => {
        this.socket.off(eventName);
      };
    });
  }

  // Join a specific room
  joinRoom(roomId: string) {
    this.socket.emit('joinRoom', roomId);
  }

  // Leave a specific room
  leaveRoom(roomId: string) {
    this.socket.emit('leaveRoom', roomId);
  }

  // Manually stop listening to an event
  stopListening(eventName: string) {
    this.socket.off(eventName);
  }

  // Listen to room creation (custom usage)
  listenForNewRoom(): Observable<any> {
    return this.listen('newRoom');
  }

  // NEW METHODS - Seen functionality
  onNewMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('newMessage', (message: any) => {
        observer.next(message);
      });
    });
  }

  onMessagesSeen(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('messagesSeen', (data: any) => {
        observer.next(data);
      });
    });
  }

  emitMessagesSeen(roomId: string): void {
    this.socket.emit('messagesSeen', { roomId });
  }

  // NEW: Listen for user status changes
  onUserStatusChange(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('userStatusChange', (data: any) => {
        observer.next(data);
      });
    });
  }

  // NEW: Emit user online status
  emitUserOnline(): void {
    this.socket.emit('userOnline');
  }

  // NEW: Emit user offline status
  emitUserOffline(): void {
    this.socket.emit('userOffline');
  }

  // NEW: Listen for typing indicators
  onUserTyping(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('userTyping', (data: any) => {
        observer.next(data);
      });
    });
  }

  // NEW: Emit typing status
  emitTyping(roomId: string, isTyping: boolean): void {
    this.socket.emit('typing', { roomId, isTyping });
  }

  // NEW: Listen for room updates
  onRoomUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('roomUpdate', (data: any) => {
        observer.next(data);
      });
    });
  }

  // UTILITY METHODS
  isConnected(): boolean {
    return this.socket.connected;
  }

  getSocketId(): string {
    return this.socket.id;
  }

  // Error handling
  onError(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('error', (error: any) => {
        observer.next(error);
      });
    });
  }

  onConnect(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('connect', () => {
        observer.next('Connected to socket server');
      });
    });
  }

  onDisconnect(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('disconnect', (reason: string) => {
        observer.next(`Disconnected: ${reason}`);
      });
    });
  }
}
