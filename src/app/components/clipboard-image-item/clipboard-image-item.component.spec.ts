import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipboardImageItemComponent } from './clipboard-image-item.component';

describe('ClipboardImageItemComponent', () => {
  let component: ClipboardImageItemComponent;
  let fixture: ComponentFixture<ClipboardImageItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClipboardImageItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClipboardImageItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
