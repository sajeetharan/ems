import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  templateUrl: './message-modal.component.html'
})
export class MessageModalComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {header: string, message: string}) {}
}
