import { Component, EventEmitter, Input, Output, OnChanges, HostListener, OnInit } from '@angular/core';
import { CreateEventModel, UpdateEventModel, EventType, EventModel } from '../../../models/event.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { EventService } from '../../../services/event.service';
import {OrganisationService} from '../../../services/organisation.service';

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
    protected organisationId= localStorage.getItem('organisation') || '';
    formData: Partial<CreateEventModel | UpdateEventModel> = this.getDefaultFormData();
    selectedParticipants: string[] = [];
    originalParticipants: string[] = []; // Pour tracker les participants originaux
    eventTypeList: EventType[] = Object.values(EventType);
    participantSearchTerm: string = '';
    showParticipantDropdown: boolean = false;
    filteredUsers: any[] = [];

    constructor(private userService: UserService, private eventService: EventService,private organisationService: OrganisationService) { }
    selectedFile: File | null = null;
    filePreviewUrl: string | null = null;

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
                participants: this.event.participants
                    ? this.event.participants.map(p => this.getParticipantId(p))
                    : [],
                type_recurrence: this.event.type_recurrence,
                rappel: this.event.rappel ? [...this.event.rappel] : [],
                file: this.event.file || ''
            };
             // Si un fichier existe déjà, préparez l'URL de prévisualisation
            if (this.event.file) {
                this.filePreviewUrl = this.event.file;
            }

            // Gestion des participants
            this.selectedParticipants = [];
            this.originalParticipants = [];
            if (this.event.participants && this.event.participants.length > 0) {
                this.selectedParticipants = this.event.participants
                    .map(p => this.getParticipantId(p))
                    .filter(id => id !== null && id !== undefined && id !== '') as string[];

                this.originalParticipants = [...this.selectedParticipants];
            }

            console.log('Selected participants after init:', this.selectedParticipants);
            console.log('Original participants:', this.originalParticipants);
        } else {
            // Mode création
            this.formData = this.getDefaultFormData();
            this.selectedParticipants = [];
            this.originalParticipants = [];
            this.selectedFile = null;
            this.filePreviewUrl = null;
        }

        this.updateFilteredUsers();
    }


     onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // Validation de la taille (exemple: max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('Le fichier est trop volumineux. Taille maximale: 10MB');
                return;
            }

            // Validation du type de fichier (optionnel)
            const allowedTypes = [
                'image/jpeg', 'image/png', 'image/gif',
                'application/pdf', 
                'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ];
            
            if (!allowedTypes.includes(file.type)) {
                alert('Type de fichier non autorisé. Types acceptés: JPG, PNG, GIF, PDF, DOC, DOCX, TXT');
                return;
            }

            this.selectedFile = file;
            
            // Créer une URL de prévisualisation pour les images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.filePreviewUrl = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                this.filePreviewUrl = null;
            }
        }
    }

    removeSelectedFile(): void {
        this.selectedFile = null;
        this.filePreviewUrl = null;
        this.formData.file = '';
        // Reset l'input file
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    private getParticipantId(participant: {
        participant_id?: string | { _id?: string; nom?: string; prenom?: string; email?: string };
        id?: string;
    }): string {
        if (!participant) {
            console.warn('Participant est invalide:', participant);
            return ''; // Retournez une chaîne vide ou gérez autrement
        }

        if (participant.participant_id) {
            return typeof participant.participant_id === 'string'
                ? participant.participant_id
                : participant.participant_id._id || '';
        }

        if (participant.id) {
            return participant.id; // Utilisez `id` si `participant_id` est absent
        }

        console.warn('Participant sans participant_id ni id:', participant);
        return ''; // Retournez une chaîne vide ou gérez autrement
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
            console.log('Participant ajouté:', user._id, 'Liste:', this.selectedParticipants);
        }
    }

    getSelectedParticipants(): Array<{_id: string, nom?: string, prenom?: string, email?: string}> {
        return this.selectedParticipants
            .map(participantId => {
                const user = this.users.find(u => u._id === participantId);
                return user || {
                    _id: participantId,
                    nom: 'Inconnu',
                    prenom: '',
                    email: ''
                };
            });
    }

    // Méthode pour supprimer un participant avec confirmation
removeParticipant(participantId: string): void {
    // Si c'est un événement existant, on supprime directement de la liste locale
    // La suppression réelle se fera lors de la soumission du formulaire
    this.selectedParticipants = this.selectedParticipants.filter(id => id !== participantId);
    this.updateFilteredUsers();

    console.log('Participant retiré de la liste:', participantId);
    console.log('Liste mise à jour:', this.selectedParticipants);
}

    // Nouvelle méthode pour supprimer un participant du backend
    private deleteParticipantFromEvent(participantId: string): void {
        if (!this.event?._id) return;

        this.eventService.deleteParticipant(this.event._id, participantId).subscribe({
            next: (response) => {
                console.log('Participant supprimé du backend:', response);
                // Retirer de la liste locale
                this.selectedParticipants = this.selectedParticipants.filter(id => id !== participantId);
                this.originalParticipants = this.originalParticipants.filter(id => id !== participantId);
                this.updateFilteredUsers();
                alert('Participant supprimé avec succès');
            },
            error: (err) => {
                console.error('Erreur lors de la suppression du participant:', err);
                alert('Erreur lors de la suppression du participant: ' + (err.error?.message || err.message));
            }
        });
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        const searchInput = target.closest('input[name="participantSearch"]');
        const dropdown = target.closest('.absolute.z-10');

        if (!searchInput && !dropdown) {
            this.showParticipantDropdown = false;
        }
    }
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
        if (!date || isNaN(date.getTime())) {
            return '';
        }

        const pad = (num: number) => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
onSubmit(): void {
    const formData = new FormData();
    console.log('Form submitted with data:', this.formData);
    console.log('Selected participants:', this.selectedParticipants);
    console.log('Original participants:', this.originalParticipants);

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

    // Préparer les données de l'événement
    const eventData: any = {
        ...this.formData,
        participants: [...this.selectedParticipants]
    };

    // Conversion des dates
    eventData.date_debut = new Date(eventData.date_debut).toISOString();
    eventData.date_fin = new Date(eventData.date_fin).toISOString();

    // Afficher les changements de participants pour debug
    if (this.event?._id) {
        const addedParticipants = this.selectedParticipants.filter(id => !this.originalParticipants.includes(id));
        const removedParticipants = this.originalParticipants.filter(id => !this.selectedParticipants.includes(id));

        console.log('Participants ajoutés:', addedParticipants);
        console.log('Participants supprimés:', removedParticipants);
    }

    if (this.event?._id) {
        // Mode update
        this.eventService.updateEvent(this.event._id, eventData).subscribe({
            next: (response) => {
                console.log('Update successful:', response);

                // Message de succès plus détaillé
                let successMessage = 'Événement mis à jour avec succès';
                if (response.addedParticipants && response.addedParticipants.length > 0) {
                    successMessage += `\n${response.addedParticipants.length} participant(s) ajouté(s)`;
                }
                if (response.removedParticipants && response.removedParticipants.length > 0) {
                    successMessage += `\n${response.removedParticipants.length} participant(s) supprimé(s)`;
                }

                alert(successMessage);
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
getParticipantChanges(): { added: string[], removed: string[] } {
    if (!this.event?._id) {
        return { added: this.selectedParticipants, removed: [] };
    }

    const added = this.selectedParticipants.filter(id => !this.originalParticipants.includes(id));
    const removed = this.originalParticipants.filter(id => !this.selectedParticipants.includes(id));

    return { added, removed };
}
showParticipantChangesSummary(): string {
    const changes = this.getParticipantChanges();
    const summary = [];

    if (changes.added.length > 0) {
        summary.push(`${changes.added.length} participant(s) à ajouter`);
    }

    if (changes.removed.length > 0) {
        summary.push(`${changes.removed.length} participant(s) à supprimer`);
    }

    return summary.length > 0 ? summary.join(', ') : 'Aucun changement';
}
    closeDialog(): void {
        console.log('Fermeture du dialog');
        this.close.emit();
    }
    private showValidationError(message: string): void {
        console.log('Message affiché:', message);
        alert(message);
    }
    getParticipantCount(): number {
        return this.selectedParticipants.length;
    }
    clearAllParticipants(): void {
        if (this.originalParticipants.length > 0 && this.event?._id) {
            if (confirm('Êtes-vous sûr de vouloir supprimer tous les participants de cet événement ?')) {
                // Supprimer tous les participants originaux du backend
                this.originalParticipants.forEach(participantId => {
                    this.deleteParticipantFromEvent(participantId);
                });
            }
        } else {
            this.selectedParticipants = [];
            this.updateFilteredUsers();
        }
    }
    isFormValid(): boolean {
        return !!(
            this.formData.titre?.trim() &&
            this.formData.date_debut &&
            this.formData.date_fin &&
            this.formData.type &&
            new Date(this.formData.date_fin) > new Date(this.formData.date_debut)
        );
    }
    isOriginalParticipant(participantId: string): boolean {
        return this.originalParticipants.includes(participantId);
    }
}
