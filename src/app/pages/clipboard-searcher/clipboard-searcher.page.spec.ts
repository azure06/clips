import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipboardSearcherPage } from './clipboard-searcher.page';

describe('Tab1Page', () => {
  let component: ClipboardSearcherPage;
  let fixture: ComponentFixture<ClipboardSearcherPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClipboardSearcherPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClipboardSearcherPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
