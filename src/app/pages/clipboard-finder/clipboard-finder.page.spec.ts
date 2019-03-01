import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipboardFinderPage } from './clipboard-finder.page';

describe('ClipboardFinderPage', () => {
  let component: ClipboardFinderPage;
  let fixture: ComponentFixture<ClipboardFinderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClipboardFinderPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClipboardFinderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
