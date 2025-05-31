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
  organisationId: string = '6810e0c5e88e782d899ad96b';
  isSearching: boolean = false;
  
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
    this.loadUnreadCounts();
    this.setupSocketListeners();
  }

  ngOnDestroy(): void {
    this.rooms.forEach(room => {
      this.socketService.leaveRoom(room._id);
    });
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      tap(() => this.isSearching = true),
      filter((query): query is string => query !== null),
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
        this.loadUnreadCountsForRooms(rooms);
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

  private loadUnreadCounts(): void {
    this.messageService.getAllUnreadCounts().subscribe({
      next: (counts) => {
        this.unreadCounts = counts || {};
      },
      error: (err) => {
        console.error('Error loading unread counts:', err);
        this.unreadCounts = {};
      }
    });
  }

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

  private setupSocketListeners(): void {
    this.socketService.onNewMessage().pipe(
      takeUntil(this.destroy$)
    ).subscribe((message: any) => {
      const roomIndex = this.rooms.findIndex(r => r._id === message.roomId);
      if (roomIndex !== -1) {
        this.rooms[roomIndex].lastMessage = {
          content: message.content,
          timestamp: message.createdAt,
          sender: message.sender
        };

        if (message.roomId !== this.selectedRoomId) {
          this.unreadCounts[message.roomId] = (this.unreadCounts[message.roomId] || 0) + 1;
        }

        const updatedRoom = this.rooms.splice(roomIndex, 1)[0];
        this.rooms.unshift(updatedRoom);
        this.updateRoomArrays();
      }
    });

    this.socketService.onMessagesSeen().pipe(
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      if (data.roomId) {
        this.unreadCounts[data.roomId] = 0;
      }
    });
  }

  loadLastMessages(roomsArray: any[] = this.rooms): void {
    roomsArray.forEach(room => {
      this.messageService.getLastMessageByRoom(room._id).subscribe({
        next: (lastMessage) => {
          room.lastMessage = lastMessage && lastMessage.content !== undefined ? {
            content: lastMessage.content,
            timestamp: lastMessage.createdAt,
            sender: lastMessage.sender
          } : {
            content: 'No messages yet',
            timestamp: null,
            sender: null
          };
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
      this.socketService.joinRoom(room._id);
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
    this.selectedRoomId = roomId;
    this.markRoomMessagesAsSeen(roomId);
    this.router.navigate(['/chat', roomId]);
  }

  getUserRooms(): void {
    this.roomService.getRoomsByUser().subscribe({
      next: (res) => {
        this.rooms = res;
        this.updateRoomArrays();
        this.loadLastMessages();
        this.loadUnreadCounts();
      },
      error: (err) => {
        console.error('Error fetching rooms', err);
      }
    });
  }

  private markRoomMessagesAsSeen(roomId: string): void {
    if (this.hasUnreadMessages(roomId)) {
      this.messageService.markMessagesAsSeen(roomId).subscribe({
        next: () => {
          this.unreadCounts[roomId] = 0;
          this.socketService.emitMessagesSeen(roomId);
        },
        error: (err) => {
          console.error('Error marking messages as seen:', err);
        }
      });
    }
  }

  selectRoom(roomId: string): void {
    this.navigateToRoom(roomId);
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

  getUnreadCount(roomId: string): number {
    return this.unreadCounts[roomId] || 0;
  }

  hasUnreadMessages(roomId: string): boolean {
    return this.getUnreadCount(roomId) > 0;
  }

  getTotalUnreadCount(): number {
    return Object.values(this.unreadCounts).reduce((total, count) => total + count, 0);
  }

  formatUnreadCount(count: number): string {
    return count > 99 ? '99+' : count.toString();
  }
}