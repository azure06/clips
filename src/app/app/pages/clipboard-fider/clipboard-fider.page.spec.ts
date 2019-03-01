import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipboardFiderPage } from './clipboard-fider.page';

describe('ClipboardFiderPage', () => {
  let component: ClipboardFiderPage;
  let fixture: ComponentFixture<ClipboardFiderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClipboardFiderPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClipboardFiderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
