export interface HolidayModel {
    _id?: string;
    date: string;
    titre: string;
    description: string;
    type: 'national' | 'religieux' | 'autre';
  }
  