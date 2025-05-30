import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackofficeModalComponent } from './backoffice-modal.component';

describe('BackofficeModalComponent', () => {
  let component: BackofficeModalComponent;
  let fixture: ComponentFixture<BackofficeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackofficeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackofficeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
