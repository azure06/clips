import { Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators
} from '@angular/forms';
import { ErrorStateMatcher, MatSnackBar } from '@angular/material';

/** Error when invalid control is dirty, touched, or submitted. */
export class ContractErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    // const isSubmitted = form && form.submitted; Not resetted after submission
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

// tslint:disable-next-line: max-classes-per-file
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'snack-bar-component',
  template: `
    <span class="content">
      Message successfully sent! 😀
    </span>
  `,
  styles: [
    `
      .snackbar-container {
        background: var(--ion-color-primary);
      }
      .content {
        color: white;
      }
    `
  ]
})
export class SnackBarComponent {}

// tslint:disable-next-line: max-classes-per-file
@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss']
})
export class ContactPage {
  constructor(
    private fns: AngularFireFunctions,
    private snackBar: MatSnackBar
  ) {}

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

  public openSnackBar() {
    this.snackBar.openFromComponent(SnackBarComponent, {
      duration: 5 * 1000,
      panelClass: ['snackbar-container'],
      verticalPosition: 'top'
    });
  }

  public async send() {
    if (this.form.valid) {
      const {
        nameFormControl,
        emailFormControl,
        contentFormControl
      } = this.form.value;
      const callable = this.fns.httpsCallable('sendContactMail');
      callable({
        to: 'gabri06e@gmail.com',
        fullName: nameFormControl,
        email: emailFormControl,
        content: contentFormControl
      })
        .toPromise()
        .then(() => {
          this.form.reset();
          this.openSnackBar();
        })
        .catch(error => console.error(error));
    }
  }
}
