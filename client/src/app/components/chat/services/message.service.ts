import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable , BehaviorSubject, of } from 'rxjs';
import { catchError, map, distinctUntilChanged } from 'rxjs/operators';
import { SocketService } from './socket.service';
// Définition du modèle de Message
export interface Message {
  _id: string;
  //sender: { nom: string , _id: string };
  sender:String
  SenderName: string;
  content: string;
  file?: string | null;
  likes?: string[];
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
  room: string;
  seenBy?: string[]; // Liste des utilisateurs qui ont vu le message
  isSeen?: boolean; // Indique si le message a été vu par l'utilisateur actuel

}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private lastMessagesSubjects = new Map<string, BehaviorSubject<Message | null>>();

  private apiUrl = 'http://localhost:5000/api/message'; // Remplace par l'URL de ton API backend
  private RoomsUrl = 'http://localhost:5000/api/rooms'; // Pour les endpoints liés aux rooms
  constructor(private http: HttpClient, private socketService: SocketService
  ) {
    this.setupGlobalSocketListeners();

  }

  private setupGlobalSocketListeners(): void {
    // Listen for new messages globally and update the relevant room's last message
    this.socketService.onNewMessage().subscribe((message: Message) => {
      this.updateLastMessageForRoom(message.room, message);
    });
    this.socketService.onConnect().subscribe(() => {
      console.log('Socket connected for message service');
    });

    this.socketService.onDisconnect().subscribe((reason) => {
      console.log('Socket disconnected:', reason);
    });
  }

  private updateLastMessageForRoom(roomId: string, message: Message): void {
    const subject = this.lastMessagesSubjects.get(roomId);
    if (subject) {
      subject.next(message);
    }
  }
  private getOrCreateLastMessageSubject(roomId: string): BehaviorSubject<Message | null> {
    if (!this.lastMessagesSubjects.has(roomId)) {
      this.lastMessagesSubjects.set(roomId, new BehaviorSubject<Message | null>(null));
    }
    return this.lastMessagesSubjects.get(roomId)!;
  }
  stopWatchingRoom(roomId: string): void {
    this.socketService.leaveRoom(roomId);
    const subject = this.lastMessagesSubjects.get(roomId);
    if (subject) {
      subject.complete();
      this.lastMessagesSubjects.delete(roomId);
    }
  }/*
  // Original HTTP method for initial fetch
  getLastMessageByRoom(roomId: string): Observable<Message | null> {
    return this.http.get<Message>(`${this.RoomsUrl}/room/${roomId}/last`).pipe(
      catchError(error => {
        console.error(`Error fetching last message for room ${roomId}:`, error);
        return of(null);
      })
    );
  }*/

  // NEW: Get real-time last message for a specific room
  getLastMessageRealTime(roomId: string): Observable<Message | null> {
    const subject = this.getOrCreateLastMessageSubject(roomId);

    // Join the room for socket updates
    this.socketService.joinRoom(roomId);

    // Fetch initial last message if we don't have one
    if (!subject.value) {
      this.getLastMessageByRoom(roomId).subscribe(message => {
        subject.next(message);
      });
    }

    // Return the observable with distinct values only
    return subject.asObservable().pipe(
      distinctUntilChanged((prev, curr) => {
        if (!prev && !curr) return true;
        if (!prev || !curr) return false;
        return prev._id === curr._id;
      })
    );
  }
  /*
  getLastMessagesForRooms(roomIds: string[]): Observable<{[roomId: string]: Message | null}> {
      const lastMessages: {[roomId: string]: Message | null} = {};

      // Join all rooms and get their last messages
      roomIds.forEach(roomId => {
        this.socketService.joinRoom(roomId);
        this.getLastMessageByRoom(roomId).subscribe(message => {
          lastMessages[roomId] = message;
          this.updateLastMessageForRoom(roomId, message);
        });
      });

      return of(lastMessages);
    }*/



  getMessagesByRoom(roomId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/getMessagesByRoom/${roomId}`);
  }
  sendMessage(formData: FormData): Observable<Message> {
    const staticToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjljOTk4ZjdiYzQzZTJlMWJhYTQ5OCIsImlhdCI6MTc0NjI4Mjc3OCwiZXhwIjoxNzQ2MzE4Nzc4fQ.LiJBu6W9UIHst1XlYTigG7QlqEnquz6Tq2sukiT2_sY';

    // Get token from storage or use fallback
    const token = localStorage.getItem('token') || staticToken;  // Default to static if no token

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Message>(`${this.apiUrl}/createMsgWS`, formData, { headers });
  }

  updateMessage(id: string, data: { content: string }): Observable<Message> {
    const staticToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjljOTk4ZjdiYzQzZTJlMWJhYTQ5OCIsImlhdCI6MTc0NjI4Mjc3OCwiZXhwIjoxNzQ2MzE4Nzc4fQ.LiJBu6W9UIHst1XlYTigG7QlqEnquz6Tq2sukiT2_sY';
    const token = localStorage.getItem('token') || staticToken;  // Default to static if no token

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<Message>(`${this.apiUrl}/updateMsg/${id}`, data, { headers });
  }
  deleteMessage(id: string) {

    const staticToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjljOTk4ZjdiYzQzZTJlMWJhYTQ5OCIsImlhdCI6MTc0NjI4Mjc3OCwiZXhwIjoxNzQ2MzE4Nzc4fQ.LiJBu6W9UIHst1XlYTigG7QlqEnquz6Tq2sukiT2_sY';
    const token = localStorage.getItem('token') || staticToken;  // Default to static if no token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<{ message: string, id: string }>(`${this.apiUrl}/deleteMsg/${id}`, { headers });
  }
  toggleLike(id: string) {
    const staticToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjljOTk4ZjdiYzQzZTJlMWJhYTQ5OCIsImlhdCI6MTc0NjI4Mjc3OCwiZXhwIjoxNzQ2MzE4Nzc4fQ.LiJBu6W9UIHst1XlYTigG7QlqEnquz6Tq2sukiT2_sY';
    const token = localStorage.getItem('token') || staticToken;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.patch<Message>(`${this.apiUrl}/toggleLike/${id}`, {}, { headers });
  }

  pinMessage(id: string) {
    const staticToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjljOTk4ZjdiYzQzZTJlMWJhYTQ5OCIsImlhdCI6MTc0NjI4Mjc3OCwiZXhwIjoxNzQ2MzE4Nzc4fQ.LiJBu6W9UIHst1XlYTigG7QlqEnquz6Tq2sukiT2_sY';
    const token = localStorage.getItem('token') || staticToken;  // Default to static if no token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<Message>(`${this.apiUrl}/pinMsg/${id}`, {}, { headers });
  }
  getLastMessageByRoom(roomId: string): Observable<Message | null> {
    return this.http.get<Message>(`${this.RoomsUrl}/room/${roomId}/last`).pipe(
      catchError(error => {
        console.error(`Error fetching last message for room ${roomId}:`, error);
        return of(null);
      })
    );
  }
  markMessagesAsSeen(roomId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/messages/${roomId}/seen`, {});
  }

  // NEW: Get unread message count for a room
  getUnreadCount(roomId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${roomId}/unread-count`);
  }

  // NEW: Get all unread counts for user's rooms
  getAllUnreadCounts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/unread-counts`);
  }

}
