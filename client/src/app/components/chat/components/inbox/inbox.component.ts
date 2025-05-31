import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { OrganisationService } from '../../../../services/organisation.service';
import { MessageService } from '../../services/message.service';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, tap, catchError, filter } from 'rxjs/operators';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class InboxComponent implements OnInit, OnDestroy {
  rooms: any[] = [];
  filteredRooms: any[] = [];
  privateRooms: any[] = [];
  groupRooms: any[] = [];
  selectedRoomId: string | null = null;
  selectedRoomName: string | null = null;
  showUserModal: boolean = false;
  users: any[] = [];
  selectedUserId: string = '';
  isCreatingRoom: boolean = false;
  organisationId: any = localStorage.getItem('organisation');
  isSearching: boolean = false;
  
  // NEW: Track unread counts
  unreadCounts: { [roomId: string]: number } = {};

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  @Output() roomSelected = new EventEmitter<string>();
  
  constructor(
    private roomService: RoomService,
    private router: Router,
    private messageService: MessageService,
    private organisationService: OrganisationService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.getUserRooms();
    this.loadUsers();
    this.setupSearch();
    this.loadUnreadCounts(); // NEW
    this.setupSocketListeners(); // NEW
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      tap(() => this.isSearching = true),
      filter((query): query is string => query !== null), // Filter out null values
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query: string) => {
        if (query.trim() === '') {
          return this.roomService.getRoomsByUser().pipe(
            catchError(() => of([]))
          );
        } else {
          return this.roomService.searchRooms(query).pipe(
            catchError(() => of([]))
          );
        }
      }),
      tap(() => this.isSearching = false),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (rooms: any[]) => {
        this.rooms = rooms;
        this.updateRoomArrays();
        this.loadLastMessages();
        this.loadUnreadCountsForRooms(rooms); // NEW: Load unread counts for filtered rooms
      },
      error: (err: any) => {
        console.error('Search error:', err);
        this.isSearching = false;
      }
    });
  }

  private updateRoomArrays(): void {
    this.privateRooms = this.rooms.filter((room: any) => room.isPrivate);
    this.groupRooms = this.rooms.filter((room: any) => !room.isPrivate);
  }

  // NEW: Load unread counts for all rooms
  private loadUnreadCounts(): void {
    this.messageService.getAllUnreadCounts().subscribe({
      next: (counts) => {
        // counts should be an object like { roomId1: 5, roomId2: 2, ... }
        this.unreadCounts = counts || {};
      },
      error: (err) => {
        console.error('Error loading unread counts:', err);
        this.unreadCounts = {};
      }
    });
  }

  // NEW: Load unread counts for specific rooms (used after search)
  private loadUnreadCountsForRooms(rooms: any[]): void {
    rooms.forEach(room => {
      this.messageService.getUnreadCount(room._id).subscribe({
        next: (response) => {
          this.unreadCounts[room._id] = response.unreadCount || 0;
        },
        error: (err) => {
          console.error(`Error loading unread count for room ${room._id}:`, err);
          this.unreadCounts[room._id] = 0;
        }
      });
    });
  }

  // NEW: Setup socket listeners for real-time updates
  private setupSocketListeners(): void {
    // Listen for new messages to update unread counts
    this.socketService.onNewMessage().pipe(
      takeUntil(this.destroy$)
    ).subscribe((message: any) => {
      if (message.roomId && message.roomId !== this.selectedRoomId) {
        // Increment unread count for the room if it's not currently selected
        this.unreadCounts[message.roomId] = (this.unreadCounts[message.roomId] || 0) + 1;
        
        // Update last message for the room
        const room = this.rooms.find(r => r._id === message.roomId);
        if (room) {
          room.lastMessage = {
            content: message.content,
            timestamp: message.createdAt,
            sender: message.sender
          };
        }
      }
    });

    // Listen for messages marked as seen
    this.socketService.onMessagesSeen().pipe(
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      if (data.roomId) {
        this.unreadCounts[data.roomId] = 0;
      }
    });

    // Listen for user joining/leaving rooms (optional)
    this.socketService.onUserStatusChange().pipe(
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      // Handle user status changes if needed
      console.log('User status changed:', data);
    });
  }

  loadUsers(): void {
    this.organisationService.getAllUsersByOrganisation(this.organisationId).subscribe({
      next: (response: any) => {
        this.users = response.users || response;
      },
      error: (error: any) => {
        console.error('Error fetching users:', error);
      }
    });
  }

  openCreatePrivateRoomModal(): void {
    this.showUserModal = true;
  }

  closeModal(): void {
    this.showUserModal = false;
    this.selectedUserId = '';
  }

  createPrivateRoom(): void {
    if (!this.selectedUserId) {
      alert('Please select a user');
      return;
    }

    this.isCreatingRoom = true;

    this.roomService.createPrivateRoom(this.selectedUserId).subscribe({
      next: (response) => {
        this.getUserRooms();
        const roomId = response.room?._id || response._id;
        this.navigateToRoom(roomId);
        this.closeModal();
        this.isCreatingRoom = false;
      },
      error: (err) => {
        console.error('Error creating private room:', err);
        alert('Error creating private room');
        this.isCreatingRoom = false;
      }
    });
  }

  navigateToRoom(roomId: string): void {
    this.router.navigate(['/chat', roomId]);
  }

  getUserRooms(): void {
    this.roomService.getRoomsByUser().subscribe({
      next: (res) => {
        this.rooms = res;
        this.updateRoomArrays();
        this.loadLastMessages();
        this.loadUnreadCounts(); // NEW: Load unread counts when rooms are loaded
      },
      error: (err) => {
        console.error('Error fetching rooms', err);
      }
    });
  }

  loadLastMessages(roomsArray: any[] = this.rooms): void {
    roomsArray.forEach(room => {
      this.messageService.getLastMessageByRoom(room._id).subscribe({
        next: (lastMessage) => {
          if (lastMessage && lastMessage.content !== undefined) {
            room.lastMessage = {
              content: lastMessage.content,
              timestamp: lastMessage.createdAt,
              sender: lastMessage.sender
            };
          } else {
            room.lastMessage = {
              content: 'No messages yet',
              timestamp: null,
              sender: null
            };
          }
        },
        error: (err) => {
          console.error(`Error loading last message for room ${room._id}:`, err);
          room.lastMessage = {
            content: err.status === 404 ? 'No messages yet' : 'Failed to load messages',
            timestamp: null,
            sender: null
          };
        }
      });
    });
  }

  selectRoom(roomId: string): void {
    this.selectedRoomId = roomId;
    
    // NEW: Mark messages as seen when room is selected
    this.markRoomMessagesAsSeen(roomId);
    
    this.router.navigate(['/chat', roomId]);
  }

  // NEW: Mark messages as seen for a specific room
  private markRoomMessagesAsSeen(roomId: string): void {
    // Only mark as seen if there are unread messages
    if (this.hasUnreadMessages(roomId)) {
      this.messageService.markMessagesAsSeen(roomId).subscribe({
        next: () => {
          // Reset unread count for this room
          this.unreadCounts[roomId] = 0;
          
          // Emit socket event to notify other users
          this.socketService.emitMessagesSeen(roomId);
        },
        error: (err) => {
          console.error('Error marking messages as seen:', err);
        }
      });
    }
  }

  // NEW: Mark messages as seen when user focuses on input (called from chat component)
  markMessagesAsSeenOnFocus(roomId: string): void {
    this.markRoomMessagesAsSeen(roomId);
  }

  getRoomName(roomId: string): string {
    const room = this.rooms.find(r => r._id === roomId);
    return room ? room.name : 'Room';
  }

  isRoomSelected(roomId: string): boolean {
    return this.selectedRoomId === roomId;
  }

  getRoomInitial(roomName: string): string {
    return roomName?.charAt(0)?.toUpperCase() || 'R';
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchControl.setValue(query);
  }

  // NEW: Get unread count for a room
  getUnreadCount(roomId: string): number {
    return this.unreadCounts[roomId] || 0;
  }

  // NEW: Check if room has unread messages
  hasUnreadMessages(roomId: string): boolean {
    return this.getUnreadCount(roomId) > 0;
  }

  // NEW: Get total unread count across all rooms
  getTotalUnreadCount(): number {
    return Object.values(this.unreadCounts).reduce((total, count) => total + count, 0);
  }

  // NEW: Format unread count for display (e.g., 99+ for counts over 99)
  formatUnreadCount(count: number): string {
    if (count > 99) {
      return '99+';
    }
    return count.toString();
  }

  // NEW: Handle room updates from socket
  handleRoomUpdate(roomData: any): void {
    const existingRoomIndex = this.rooms.findIndex(room => room._id === roomData._id);
    if (existingRoomIndex !== -1) {
      // Update existing room
      this.rooms[existingRoomIndex] = { ...this.rooms[existingRoomIndex], ...roomData };
    } else {
      // Add new room
      this.rooms.push(roomData);
    }
    this.updateRoomArrays();
  }

  // NEW: Clear all notifications for debugging/admin purposes
  clearAllUnreadCounts(): void {
    Object.keys(this.unreadCounts).forEach(roomId => {
      this.unreadCounts[roomId] = 0;
    });
  }
}