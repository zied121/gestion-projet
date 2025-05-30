import { TestBed } from '@angular/core/testing';

import { GoogleserviceService } from './googleservice.service';

describe('GoogleserviceService', () => {
  let service: GoogleserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
