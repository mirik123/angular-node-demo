
import { MdDialogRef } from '@angular/material';
import { Component } from '@angular/core';

@Component({
    selector: 'alert-dialog',
    template: `<div md-dialog-title>{{title}}</div>
        <md-dialog-content>{{message}}</md-dialog-content>
        <md-dialog-actions>
            <button type="button" md-dialog-close md-raised-button on-click="dialogRef.close()">{{okbtn}}</button>
        </md-dialog-actions>`,
})
export class ConfirmDialog {
    public okbtn: string;
    public title: string;
    public message: string;

    constructor(public dialogRef: MdDialogRef<ConfirmDialog>) {

    }
}