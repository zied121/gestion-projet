import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../services/room.service';
import { ProjectService } from '../../../../services/project.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackofficeModalComponent } from '../backoffice-modal/backoffice-modal.component';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { OrganisationService } from '../../../../services/organisation.service';
import { Room } from '../../../../../../models/room.model';

@Component({
  selector: 'app-backoffice',
  templateUrl: './backoffice.component.html',
  imports: [
    NgForOf,
    NgClass,
    NgIf
  ],
  styleUrls: ['./backoffice.component.css']
})
export class BackofficeComponent implements OnInit {
  rooms: any[] = [];
  expandedRoomId: string | null = null;
  projectname: any = '';

  constructor(
    private roomService: RoomService,
    private modalService: NgbModal,
    private roomservice: RoomService,
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getRoomsPerowner().subscribe({
      next: (res) => {
        this.rooms = res;
        console.log(res);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des rooms :', err);
      }
    });
  }

  toggleExpand(RoomID: string): void {
    if (this.expandedRoomId === RoomID) {
      this.expandedRoomId = null;
    } else {
      this.expandedRoomId = RoomID;
      const room = this.rooms.find(p => p._id === RoomID);
      if (room && room.members) {
        this.roomservice.getRoomUsers(RoomID).subscribe(users => {
          room.members = users;
        });
      }
    }
  }

  openModal(room?: any): void {
    const modalRef = this.modalService.open(BackofficeModalComponent, { ariaLabelledBy: 'modal-basic-title' });
    modalRef.componentInstance.isEditMode = !!room;
    modalRef.componentInstance.roomData = room ? { ...room } : null;

    modalRef.componentInstance.save.subscribe((roomFormData: FormData) => {
      if (room) {
        this.updateRoom(room._id, roomFormData);
      } else {
        this.addRoom(roomFormData);
      }
      modalRef.close();
    });

    modalRef.componentInstance.close.subscribe(() => {
      modalRef.close();
    });
  }

  addRoom(data: FormData): void {
    const projectId = data.get('project') as string;
    console.log('Project ID:', projectId);
    this.roomService.createRoom(data, projectId).subscribe({
      next: (res) => {
        console.log('Room created:', res);
        this.rooms.push(res);
        this.loadRooms(); // optional
      }
    });

  }

  updateRoom(id: string, data: FormData): void {
    this.roomService.updateRoom(id, data).subscribe({
      next: (res) => {
        console.log('Room created:', res);
        this.rooms.push(res);
        this.loadRooms(); // optional
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la room :', err);
      }
    });
  }

  deleteRoom(roomId: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette room ?')) {
      return;
    }

    this.roomService.deleteRoom(roomId).subscribe({
      next: () => {
        this.rooms = this.rooms.filter(r => r._id !== roomId);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression de la room :', err);
      }
    });
  }
}
