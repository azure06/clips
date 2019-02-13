import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipboardHistoryPage } from './clipboard-history.page';

describe('Tab1Page', () => {
  let component: ClipboardHistoryPage;
  let fixture: ComponentFixture<ClipboardHistoryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClipboardHistoryPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClipboardHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
