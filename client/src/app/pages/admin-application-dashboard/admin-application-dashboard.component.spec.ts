import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminApplicationDashboardComponent } from './admin-application-dashboard.component';

describe('AdminApplicationDashboardComponent', () => {
  let component: AdminApplicationDashboardComponent;
  let fixture: ComponentFixture<AdminApplicationDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminApplicationDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminApplicationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
