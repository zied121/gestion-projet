import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceformComponent } from './workspaceform.component';

describe('WorkspaceformComponent', () => {
  let component: WorkspaceformComponent;
  let fixture: ComponentFixture<WorkspaceformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
