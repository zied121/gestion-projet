import { Component, EventEmitter, Input, Output, OnChanges, HostListener, OnInit } from '@angular/core';
import { CreateEventModel, UpdateEventModel, EventType, EventModel } from '../../../models/event.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { EventService } from '../../../services/event.service';

@Component({
    selector: 'app-event-form-dialog',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './event-form-dialog.component.html',
    styleUrls: ['./event-form-dialog.component.css'],
})
export class EventFormDialogComponent implements OnInit, OnChanges {
    @Input() event: EventModel | null = null;
    @Input() users: any[] = [];
    @Output() close = new EventEmitter<void>();
    @Output() submitSuccess = new EventEmitter<void>();

    formData: Partial<CreateEventModel | UpdateEventModel> = this.getDefaultFormData();
    selectedParticipants: string[] = [];
    eventTypeList: EventType[] = Object.values(EventType);
    participantSearchTerm: string = '';
    showParticipantDropdown: boolean = false;
    filteredUsers: any[] = [];
    constructor(private userService: UserService, private eventService: EventService) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    ngOnChanges(): void {
        console.log('Input event changed:', this.event);
        
        if (this.event) {
            // Mode édition
            this.formData = {
                _id: this.event._id,
                type: this.event.type,
                titre: this.event.titre,
                description: this.event.description,
                date_debut: this.formatDateTimeLocal(new Date(this.event.date_debut)),
                date_fin: this.formatDateTimeLocal(new Date(this.event.date_fin)),
                emplacement: this.event.emplacement,
                lien: this.event.lien,
                status: this.event.status,
                isRecurring: this.event.isRecurring,
                type_recurrence: this.event.type_recurrence,
                rappel: this.event.rappel ? [...this.event.rappel] : []
            };
            
            // Gestion des participants
            this.selectedParticipants = [];
            if (this.event.participants && this.event.participants.length > 0) {
                this.selectedParticipants = this.event.participants.map(p => {
                    if (typeof p.participant_id === 'string') {
                        return p.participant_id;
                    } else {
                        return p.participant_id;
                    }
                });
            }
        } else {
            // Mode création
            this.formData = this.getDefaultFormData();
            this.selectedParticipants = [];
        }
        
        this.updateFilteredUsers();
    }

    // FIX: Méthodes de gestion des changements plus robustes
  

    private loadUsers(): void {
        this.userService.getAllUsers().subscribe({
            next: (res) => {
                console.log('Fetched users:', res);
                this.users = res.users;
                this.updateFilteredUsers();
            },
            error: (err) => console.error('Error fetching users:', err),
        });
    }

    private getDefaultFormData(): CreateEventModel {
        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 2 hours from now

        return {
            titre: '',
            description: '',
            type: EventType.EVENEMENT,
            date_debut: this.formatDateTimeLocal(start),
            date_fin: this.formatDateTimeLocal(end),
            emplacement: '',
            lien: '',
            type_recurrence: 'none',
            isRecurring: false,
            status: 'En_attente',
            participants: [],
            rappel: [],
        };
    }

    // Enhanced participant management methods
    onParticipantSearch(): void {
        this.updateFilteredUsers();
        this.showParticipantDropdown = true;
    }

    private updateFilteredUsers(): void {
        const searchTerm = this.participantSearchTerm.toLowerCase().trim();

        // Filter out already selected participants and apply search filter
        this.filteredUsers = this.users.filter(user => {
            const isAlreadySelected = this.selectedParticipants.includes(user._id);
            const matchesSearch = !searchTerm ||
                user.nom?.toLowerCase().includes(searchTerm) ||
                user.prenom?.toLowerCase().includes(searchTerm) ||
                user.email?.toLowerCase().includes(searchTerm);

            return !isAlreadySelected && matchesSearch;
        });
    }

    getFilteredUsers(): any[] {
        return this.filteredUsers.slice(0, 10); // Limit to 10 results for better UX
    }

    addParticipant(user: any): void {
        if (!this.selectedParticipants.includes(user._id)) {
            this.selectedParticipants.push(user._id);
            this.participantSearchTerm = '';
            this.showParticipantDropdown = false;
            this.updateFilteredUsers();
            console.log('Participant ajouté:', user._id, 'Liste:', this.selectedParticipants);
        }
    }



    getSelectedParticipants(): any[] {
        return this.users.filter(user => this.selectedParticipants.includes(user._id));
    }

    // Close dropdown when clicking outside
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        const searchInput = target.closest('input[name="participantSearch"]');
        const dropdown = target.closest('.absolute.z-10');

        if (!searchInput && !dropdown) {
            this.showParticipantDropdown = false;
        }
    }

    // Existing methods
    addReminder(): void {
        if (!this.formData.rappel) {
            this.formData.rappel = [];
        }
        this.formData.rappel.push({ time: 15, unit: 'minutes', sent: false });
    }

    removeReminder(index: number): void {
        if (this.formData.rappel) {
            this.formData.rappel.splice(index, 1);
        }
    }

    // FIX: Méthode de formatage améliorée
    formatDateTimeLocal(date: Date): string {
        if (!date || isNaN(date.getTime())) {
            return '';
        }
        
        const pad = (num: number) => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    // FIX: Méthode onSubmit complètement remaniée
    onSubmit(): void {
        console.log('Form submitted with data:', this.formData);
        console.log('Selected participants:', this.selectedParticipants);
    
        // Validation
        if (!this.formData.titre?.trim()) {
            alert('Veuillez saisir un titre pour l\'événement.');
            return;
        }
    
        if (!this.formData.date_debut || !this.formData.date_fin) {
            alert('Veuillez sélectionner des dates de début et de fin.');
            return;
        }
    
        const startDate = new Date(this.formData.date_debut);
        const endDate = new Date(this.formData.date_fin);
    
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            alert('Dates invalides. Veuillez vérifier les dates saisies.');
            return;
        }
    
        if (endDate <= startDate) {
            alert('La date de fin doit être postérieure à la date de début.');
            return;
        }
    
        const eventData: any = {
            ...this.formData,
            participants: [...this.selectedParticipants]
        };

        // Conversion des dates
        eventData.date_debut = new Date(eventData.date_debut).toISOString();
        eventData.date_fin = new Date(eventData.date_fin).toISOString();

        if (this.event?._id) {
           // Mode update
           this.eventService.updateEvent(this.event._id, eventData).subscribe({
            next: (response) => {
                console.log('Update successful:', response);
                alert('Événement mis à jour avec succès');
                this.submitSuccess.emit();
                this.close.emit();
            },
            error: (err) => {
                console.error('Update error:', err);
                alert('Erreur lors de la mise à jour: ' + (err.error?.message || err.message));
            }
        });
        } else {
            // Create mode
            this.eventService.createEvent(eventData as CreateEventModel).subscribe({
                next: (response) => {
                    console.log('Create successful:', response);
                    alert('Événement créé avec succès.');
                    this.submitSuccess.emit();
                    this.close.emit();
                },
                error: (err) => {
                    console.error('Create error:', err);
                    alert('Erreur lors de la création: ' + (err.error?.message || err.message));
                }
            });
        }
    }

    closeDialog(): void {
        console.log('Fermeture du dialog');
        this.close.emit();
    }

    private showValidationError(message: string): void {
        console.log('Message affiché:', message);
        alert(message); // Remplacez par votre système de notification préféré
    }
    removeParticipant(participantId: string): void {
        this.selectedParticipants = this.selectedParticipants.filter(id => id !== participantId);
        this.updateFilteredUsers();
    }

    // Utility method to get participant count for display
    getParticipantCount(): number {
        return this.selectedParticipants.length;
    }

    // Method to clear all participants
    clearAllParticipants(): void {
        this.selectedParticipants = [];
        this.updateFilteredUsers();
    }

    // Method to check if form is valid
    isFormValid(): boolean {
        return !!(
            this.formData.titre?.trim() &&
            this.formData.date_debut &&
            this.formData.date_fin &&
            this.formData.type &&
            new Date(this.formData.date_fin) > new Date(this.formData.date_debut)
        );
    }
}