import { Component, EventEmitter, Input, Output, OnChanges, HostListener, OnInit } from '@angular/core';
import { CreateEventModel, UpdateEventModel, EventType } from '../../../models/event.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { EventService } from '../../../services/event.service';

@Component({
    selector: 'app-event-form-dialog',
    standalone: true,
    imports: [
        FormsModule,
        CommonModule
    ],
    templateUrl: './event-form-dialog.component.html',
    styleUrls: ['./event-form-dialog.component.css'],
})
export class EventFormDialogComponent implements OnInit, OnChanges {
    @Input() event: CreateEventModel | UpdateEventModel | null = null;
    @Input() users: any[] = [];
    @Output() close = new EventEmitter<void>();
    @Output() submitSuccess = new EventEmitter<void>();

    formData: CreateEventModel | UpdateEventModel = this.getDefaultFormData();
    selectedParticipants: string[] = [];
    eventTypeList: EventType[] = Object.values(EventType);

    // Enhanced participant selection properties
    participantSearchTerm: string = '';
    showParticipantDropdown: boolean = false;
    filteredUsers: any[] = [];

    constructor(private userService: UserService, private eventService: EventService) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    ngOnChanges(): void {
        if (this.event) {
            this.formData = {
                ...this.event,
                date_debut: this.formatDateTimeLocal(new Date(this.event.date_debut ?? '')),
                date_fin: this.formatDateTimeLocal(new Date(this.event.date_fin ?? '')),
            };
            
            // Initialiser les participants sélectionnés
            this.selectedParticipants = [];
            if (this.event.participants) {
                this.event.participants.forEach(p => {
                    if (typeof p === 'object' && 'participant_id' in p) {
                        this.selectedParticipants.push(p.participant_id);
                    } else if (typeof p === 'string') {
                        this.selectedParticipants.push(p);
                    }
                });
            }
        } else {
            this.formData = this.getDefaultFormData();
            this.selectedParticipants = [];
        }
    
        this.updateFilteredUsers();
    }

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
        }
    }

    removeParticipant(participantId: string): void {
        this.selectedParticipants = this.selectedParticipants.filter(id => id !== participantId);
        this.updateFilteredUsers();
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

    formatDateTimeLocal(date: Date): string {
        const pad = (num: number) => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    onSubmit(): void {
        // Validate required fields
        if (!this.formData.titre?.trim()) {
            this.showValidationError('Please enter an event title.');
            return;
        }
    
        if (!this.formData.date_debut) {
            this.showValidationError('Please select a start date and time.');
            return;
        }
    
        if (!this.formData.date_fin) {
            this.showValidationError('Please select an end date and time.');
            return;
        }
    
        if (!this.formData.type) {
            this.showValidationError('Please select an event type.');
            return;
        }
    
        // Validate date logic
        const startDate = new Date(this.formData.date_debut);
        const endDate = new Date(this.formData.date_fin);
    
        if (endDate <= startDate) {
            this.showValidationError('End date must be after start date.');
            return;
        }
    
        // ✅ FIX: Prepare participants data according to backend expectations
        if (this.selectedParticipants.length > 0) {
            // For updates, send participants as array of IDs (backend will handle the format conversion)
            this.formData.participants = this.selectedParticipants;
        } else {
            this.formData.participants = [];
        }
    
        // If location is empty but link is provided, set location to "Online"
        if (!this.formData.emplacement && this.formData.lien) {
            this.formData.emplacement = 'En ligne'; // Use French as backend expects
        }
    
        // Clean up empty reminder arrays
        if (this.formData.rappel && this.formData.rappel.length === 0) {
            this.formData.rappel = [];
        }

        // ✅ FIX: Handle recurrence properly
        if (this.formData.type_recurrence && this.formData.type_recurrence !== 'none') {
            this.formData.isRecurring = true;
        } else {
            this.formData.isRecurring = false;
            this.formData.type_recurrence = 'none';
        }
    
        // Check if this is an update or create operation
        if (this.event && this.event._id) {
            // Update existing event
            this.updateExistingEvent();
        } else {
            // Create new event
            this.createNewEvent();
        }
    }   
    
    private createNewEvent(): void {
        console.log('Creating event with data:', this.formData);
    
        this.eventService.createEvent(this.formData as CreateEventModel).subscribe({
            next: () => {
                console.log('Event created successfully.');
                this.submitSuccess.emit(); // Notify parent component
                this.close.emit(); // Close the dialog
            },
            error: (err) => {
                console.error('Error creating event:', err);
                const errorMessage = err.error?.message || 'Failed to create the event. Please try again.';
                this.showValidationError(errorMessage);
            }
        });
    }
    
    private updateExistingEvent(): void {
        if (!this.event?._id) {
            this.showValidationError('Event ID is missing.');
            return;
        }
    
        // ✅ FIX: Clean the update data - remove undefined/null values
        const updateData: any = {};
        
        // Only include fields that have been modified or are required
        if (this.formData.titre !== undefined) updateData.titre = this.formData.titre;
        if (this.formData.description !== undefined) updateData.description = this.formData.description;
        if (this.formData.type !== undefined) updateData.type = this.formData.type;
        if (this.formData.date_debut !== undefined) updateData.date_debut = this.formData.date_debut;
        if (this.formData.date_fin !== undefined) updateData.date_fin = this.formData.date_fin;
        if (this.formData.emplacement !== undefined) updateData.emplacement = this.formData.emplacement;
        if (this.formData.lien !== undefined) updateData.lien = this.formData.lien;
        if (this.formData.status !== undefined) updateData.status = this.formData.status;
        if (this.formData.type_recurrence !== undefined) updateData.type_recurrence = this.formData.type_recurrence;
        if (this.formData.isRecurring !== undefined) updateData.isRecurring = this.formData.isRecurring;
        if (this.formData.rappel !== undefined) updateData.rappel = this.formData.rappel;
        
        
        this.eventService.updateEvent(this.event._id, updateData).subscribe({
            next: (response) => {
                console.log('Event updated successfully:', response);
                this.submitSuccess.emit();
                this.close.emit();
            },
            error: (err) => {
                console.error('Error updating event:', err);
                console.error('Error details:', err.error);
                const errorMessage = err.error?.message || 'Failed to update the event. Please try again.';
                this.showValidationError(errorMessage);
            }
        });
    }




















    private showValidationError(message: string): void {
        // You can replace this with a proper toast notification or modal
        alert(message);
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