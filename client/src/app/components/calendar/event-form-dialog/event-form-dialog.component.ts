//event-form-dialog.component.ts

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
        private readonly BACKEND_URL = 'http://localhost:5000'; // URL de votre backend

    protected organisationId= localStorage.getItem('organisation') || '';
    formData: Partial<CreateEventModel | UpdateEventModel> = this.getDefaultFormData();
    selectedParticipants: string[] = [];
    originalParticipants: string[] = []; // Pour tracker les participants originaux
    eventTypeList: EventType[] = Object.values(EventType);
    participantSearchTerm: string = '';
    showParticipantDropdown: boolean = false;
    filteredUsers: any[] = [];
    

    constructor(private userService: UserService, private eventService: EventService,private organisationService: OrganisationService) { }
  selectedfile: File | null = null;
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
             // Si un file existe déjà, préparez l'URL de prévisualisation
             if (this.event.file) {
                // Si le fichier contient déjà l'URL complète, l'utiliser tel quel
                if (this.event.file.startsWith('http')) {
                    this.filePreviewUrl = this.event.file;
                } else {
                    // Sinon, construire l'URL complète
                    this.filePreviewUrl = `${this.BACKEND_URL}${this.event.file}`;
                }
                console.log('File preview URL:', this.filePreviewUrl);
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
            this.selectedfile = null;
            this.filePreviewUrl = null;
        }

        this.updateFilteredUsers();
    }

getFileUrl(filename: string): string {
    if (!filename) return '';
    
    // Si c'est déjà une URL complète
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }
    
    // Si ça commence par /uploads, ajouter juste le backend URL
    if (filename.startsWith('/uploads/')) {
        return `${this.BACKEND_URL}${filename}`;
    }
    
    // Si c'est juste un nom de fichier, construire l'URL complète
    if (!filename.startsWith('/')) {
        return `${this.BACKEND_URL}/uploads/${filename}`;
    }
    
    // Fallback
    return `${this.BACKEND_URL}${filename}`;
}

// Méthode pour obtenir le nom du fichier à partir de l'URL ou du chemin
getFilename(filePath: string): string {
    if (!filePath) return 'fichier';
    
    // Si c'est une URL, extraire le nom du fichier
    if (filePath.startsWith('http')) {
        try {
            const url = new URL(filePath);
            const pathname = url.pathname;
            return pathname.split('/').pop() || 'fichier';
        } catch {
            return 'fichier';
        }
    }
    
    // Si c'est un chemin, extraire le nom
    return filePath.split('/').pop() || 'fichier';
}
// Remplacez votre méthode downloadFile actuelle par celle-ci :

downloadFile(): void {
    if (!this.filePreviewUrl) {
        alert('Aucun fichier à télécharger');
        return;
    }
    
    console.log('Téléchargement du fichier:', this.filePreviewUrl);
    
    // Méthode 1: Fetch et download blob (recommandée)
    this.downloadFileAsBlob();
}

// Nouvelle méthode pour télécharger via fetch
private async downloadFileAsBlob(): Promise<void> {
    try {
        // Afficher un indicateur de chargement
        console.log('Début du téléchargement...');
        
        const response = await fetch(this.filePreviewUrl!, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Si nécessaire
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }
        
        // Obtenir le blob du fichier
        const blob = await response.blob();
        
        // Créer une URL temporaire pour le blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Extraire le nom du fichier depuis l'URL ou utiliser un nom par défaut
        let filename = this.event?.file || 'fichier';
        
        // Si le filename contient un chemin, extraire seulement le nom
        if (filename.includes('/')) {
            filename = filename.split('/').pop() || 'fichier';
        }
        
        // Créer le lien de téléchargement
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        
        // Ajouter au DOM, cliquer et supprimer
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Nettoyer l'URL blob après un délai
        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
        }, 100);
        
        console.log('Téléchargement réussi');
        
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        
        // Fallback: ouvrir dans un nouvel onglet
        this.openFileInNewTab();
    }
}

// Méthode de fallback pour ouvrir le fichier dans un nouvel onglet
private openFileInNewTab(): void {
    console.log('Utilisation du fallback: ouverture dans un nouvel onglet');
    
    const link = document.createElement('a');
    link.href = this.filePreviewUrl!;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Méthode alternative si vous voulez essayer l'approche directe d'abord
downloadFileAlternative(): void {
    if (!this.filePreviewUrl) {
        alert('Aucun fichier à télécharger');
        return;
    }
    
    // Si c'est un fichier local (localhost), essayer la méthode directe
    if (this.filePreviewUrl.includes('localhost')) {
        this.downloadFileAsBlob();
    } else {
        // Pour les fichiers externes, ouvrir dans un nouvel onglet
        this.openFileInNewTab();
    }
}

// Méthode pour vérifier si le fichier est accessible
async checkFileAccess(): Promise<boolean> {
    if (!this.filePreviewUrl) return false;
    
    try {
        const response = await fetch(this.filePreviewUrl, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('Erreur lors de la vérification du fichier:', error);
        return false;
    }
}



   onfileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedfile = input.files[0];
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
// Méthode onSubmit avec debug étendu pour diagnostiquer l'erreur 400

// event-form-dialog.component.ts - Correction de la méthode onSubmit

onSubmit(): void {
    console.log('=== DEBUT DEBUG SUBMISSION ===');
    console.log('Form submitted with data:', this.formData);
    console.log('Selected participants:', this.selectedParticipants);
    console.log('Selected file:', this.selectedfile);
    console.log('Organisation ID:', this.organisationId);
    
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

    console.log('✅ Validation passed');

    // Décider s'il faut utiliser FormData ou un objet JSON
    const hasFile = this.selectedfile !== null && this.selectedfile !== undefined;
    let requestData: any;

    if (hasFile) {
        console.log('📎 Using FormData (with file)');
        // Utiliser FormData si un fichier est sélectionné
        const formData = new FormData();
        
        // Ajouter toutes les données du formulaire
        formData.append('type', this.formData.type || EventType.EVENEMENT);
        formData.append('titre', this.formData.titre || '');
        formData.append('description', this.formData.description || '');
        formData.append('date_debut', new Date(this.formData.date_debut).toISOString());
        formData.append('date_fin', new Date(this.formData.date_fin).toISOString());
        formData.append('emplacement', this.formData.emplacement || '');
        formData.append('lien', this.formData.lien || '');
        formData.append('type_recurrence', this.formData.type_recurrence || 'none');
        formData.append('isRecurring', this.formData.isRecurring ? 'true' : 'false');
        formData.append('status', this.formData.status || 'En_attente');
        formData.append('organisation_id', this.organisationId || '');
        
        // CORRECTION: Gestion des participants - envoyer chaque participant individuellement
        if (this.selectedParticipants && this.selectedParticipants.length > 0) {
            // Pour FormData, il faut envoyer chaque participant avec participants[]
            this.selectedParticipants.forEach(participant => {
                formData.append('participants[]', participant);
            });
        }
        console.log('fil')
        
        // CORRECTION: Gestion des rappels - envoyer chaque rappel individuellement
        if (this.formData.rappel && this.formData.rappel.length > 0) {
            this.formData.rappel.forEach((rappel, index) => {
                formData.append(`rappel[${index}][time]`, rappel.time.toString());
                formData.append(`rappel[${index}][unit]`, rappel.unit);
                formData.append(`rappel[${index}][sent]`, rappel.sent.toString());
            });
        }
        
        // Ajouter le fichier
        if (this.selectedfile) {
            console.log('📎 Adding file:', this.selectedfile.name, 'Size:', this.selectedfile.size);
            formData.append('file', this.selectedfile, this.selectedfile.name);
        }
        
        // Pour la mise à jour, ajouter l'ID
        if (this.event?._id) {
            formData.append('_id', this.event._id);
        }
        
        requestData = formData;
        
        // Debug FormData
        console.log('📋 FormData entries:');
        for (let pair of formData.entries()) {
            if (pair[1] instanceof File) {
                console.log(`${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
            } else {
                console.log(`${pair[0]}: ${pair[1]}`);
            }
        }
        
    } else {
        console.log('📄 Using JSON object (no file)');
        // Utiliser un objet JSON si aucun fichier n'est sélectionné
        requestData = {
            type: this.formData.type || EventType.EVENEMENT,
            titre: this.formData.titre || '',
            description: this.formData.description || '',
            date_debut: new Date(this.formData.date_debut).toISOString(),
            date_fin: new Date(this.formData.date_fin).toISOString(),
            emplacement: this.formData.emplacement || '',
            lien: this.formData.lien || '',
            type_recurrence: this.formData.type_recurrence || 'none',
            isRecurring: this.formData.isRecurring || false,
            status: this.formData.status || 'En_attente',
            participants: this.selectedParticipants || [],
            rappel: this.formData.rappel || [],
            organisation_id: this.organisationId || ''
        };
        
        // Pour la mise à jour, ajouter l'ID
        if (this.event?._id) {
            requestData._id = this.event._id;
        }
        
        console.log('📋 JSON object to send:', JSON.stringify(requestData, null, 2));
    }

    // Afficher les changements de participants pour debug
    if (this.event?._id) {
        const addedParticipants = this.selectedParticipants.filter(id => !this.originalParticipants.includes(id));
        const removedParticipants = this.originalParticipants.filter(id => !this.selectedParticipants.includes(id));

        console.log('👥 Participants ajoutés:', addedParticipants);
        console.log('👥 Participants supprimés:', removedParticipants);
    }

    // Vérifications supplémentaires avant envoi
    console.log('🔍 Pre-send checks:');
    console.log('- Token exists:', !!localStorage.getItem('token'));
    console.log('- Organisation ID:', this.organisationId);
    console.log('- Event type:', this.formData.type);
    console.log('- Participants count:', this.selectedParticipants.length);
    console.log('- Has file:', hasFile);

    // Envoyer la requête
    if (this.event?._id) {
        console.log('🔄 Updating existing event:', this.event._id);
        // Mode update
        this.eventService.updateEvent(this.event._id, requestData).subscribe({
            next: (response) => {
                console.log('✅ Update successful:', response);

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
                console.error('❌ Update error:', err);
                console.error('❌ Error details:', {
                    status: err.status,
                    statusText: err.statusText,
                    error: err.error,
                    message: err.message,
                    url: err.url
                });
                alert('Erreur lors de la mise à jour: ' + (err.error?.message || err.message));
            }
        });
    } else {
        console.log('➕ Creating new event');
        // Mode creation
        this.eventService.createEvent(requestData).subscribe({
            next: (response) => {
                console.log('✅ Create successful:', response);
                alert('Événement créé avec succès.');
                this.submitSuccess.emit();
                this.close.emit();
            },
            error: (err) => {
                console.error('❌ Create error:', err);
                console.error('❌ Error details:', {
                    status: err.status,
                    statusText: err.statusText,
                    error: err.error,
                    message: err.message,
                    url: err.url
                });
                
                // Message d'erreur plus détaillé
                let errorMessage = 'Erreur lors de la création: ';
                if (err.error?.message) {
                    errorMessage += err.error.message;
                } else if (err.message) {
                    errorMessage += err.message;
                } else {
                    errorMessage += `${err.status} ${err.statusText}`;
                }
                
                alert(errorMessage);
            }
        });
    }
    
    console.log('=== FIN DEBUG SUBMISSION ===');
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
