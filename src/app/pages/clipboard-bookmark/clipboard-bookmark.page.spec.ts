import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipboardBookmarkPage } from './clipboard-bookmark.page';

describe('ClipboardBookmarkPage', () => {
  let component: ClipboardBookmarkPage;
  let fixture: ComponentFixture<ClipboardBookmarkPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClipboardBookmarkPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClipboardBookmarkPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
