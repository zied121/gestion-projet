import { Component, OnInit } from '@angular/core';
      import { RoomService } from '../../services/room.service';
import { ProjectService } from '../../../../services/project.service';
      import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
      import { BackofficeModalComponent } from '../backoffice-modal/backoffice-modal.component';
import {NgForOf} from '@angular/common';
import { OrganisationService } from '../../../../services/organisation.service';

      @Component({
        selector: 'app-backoffice',
        templateUrl: './backoffice.component.html',
        imports: [
          NgForOf
        ],
        styleUrls: ['./backoffice.component.css']
      })
      export class BackofficeComponent implements OnInit {
        rooms: any[] = [];
        projectname: any = '';
        constructor(
          private roomService: RoomService,
          private modalService: NgbModal,private projectService: ProjectService
        ) {}

        ngOnInit(): void {
          this.loadRooms();
          console.log(this.rooms);
        }

        loadRooms(): void {
          this.roomService.getRoomsPerowner().subscribe({
            next: (res) => {
              this.rooms = res;
            },
            error: (err) => {
              console.error('Erreur lors de la récupération des rooms :', err);
            }
          });
        }

        openModal(room?: any): void {
          const modalRef = this.modalService.open(BackofficeModalComponent, { ariaLabelledBy: 'modal-basic-title' });
          modalRef.componentInstance.isEditMode = !!room;
          modalRef.componentInstance.roomData = room ? { ...room } : { name: '', description: '', projectId: '', image: null, members: [] };

          modalRef.componentInstance.save.subscribe((roomData: any) => {
            if (room) {
              this.updateRoom(room._id, roomData);
              console.log(roomData);
            } else {
              this.addRoom(roomData);
            }
            console.log('roomData envoyé au modal :', roomData);
            modalRef.close();
          });

          modalRef.componentInstance.close.subscribe(() => {
            modalRef.close();
          });
        }

        addRoom(data: any): void {

          this.roomService.createRoom(data,data.project).subscribe({
            next: (res) => {
              this.rooms.push(res);
              this.loadRooms();
            },
            error: (err) => {
              console.error('Erreur lors de l\'ajout de la room :', err);
            }
          });
        }

        updateRoom(id: string, data: any): void {
          this.roomService.updateRoom(id, data).subscribe({
            next: () => {
              console.log(data);
              console.log(this.rooms);
              this.loadRooms();
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
