import { Component, Input, ViewChild } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

/** Error when invalid control is dirty, touched, or submitted. */
export class ContractErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

// tslint:disable-next-line: max-classes-per-file
@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss']
})
export class ContactPage {
  constructor(private fns: AngularFireFunctions) {}
  public matcher = new ContractErrorStateMatcher();
  public form = new FormGroup({
    nameFormControl: new FormControl('', [Validators.required]),
    emailFormControl: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    contentFormControl: new FormControl('', [Validators.required])
  });

  get nameFormControl(): any {
    return this.form.get('nameFormControl');
  }

  get emailFormControl(): any {
    return this.form.get('emailFormControl');
  }

  get contentFormControl(): any {
    return this.form.get('contentFormControl');
  }

  public send() {
    if (this.form.valid) {
      const {
        nameFormControl,
        emailFormControl,
        contentFormControl
      } = this.form.value;
      const callable = this.fns.httpsCallable('sendContactMail');
      callable({
        fullName: nameFormControl,
        email: emailFormControl,
        content: contentFormControl
      });
    }
  }
}
