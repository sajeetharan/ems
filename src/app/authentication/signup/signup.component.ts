import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { Subscription } from 'rxjs';

import { Selection } from '../../common/selection-data.model' ;

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

  isLoading = false;
  roleType = 'user';
  private authStatusSub: Subscription;

  roles: Selection[] = [
    {value: 'user', viewValue: 'User'},
    {value: 'committee', viewValue: 'Committee'},
    {value: 'admin', viewValue: 'Administrator'}
  ];

  constructor(public authService: AuthenticationService) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
  }

  onSignUp(form: NgForm) {
    console.log(this.roleType);
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createUser(form.value.email, form.value.password, this.roleType);
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
}
