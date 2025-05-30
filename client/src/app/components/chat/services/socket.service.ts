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
}
