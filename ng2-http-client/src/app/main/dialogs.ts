
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
export class AlertDialog {
    public okbtn: string;
    public title: string;
    public message: string;

    constructor(public dialogRef: MdDialogRef<AlertDialog>) {}
}

@Component({
    selector: 'confirm-dialog',
    template: `<div md-dialog-title>{{title}}</div>
        <md-dialog-content>{{message}}</md-dialog-content>
        <md-dialog-actions>
            <button type="button" md-dialog-close md-raised-button on-click="dialogRef.close(true)">{{okbtn}}</button>
            <button type="button" md-dialog-close md-raised-button on-click="dialogRef.close(false)">{{cancelbtn}}</button>
        </md-dialog-actions>`,
})
export class ConfirmDialog {
    public okbtn: string;
    public cancelbtn: string;
    public title: string;
    public message: string;

    constructor(public dialogRef: MdDialogRef<ConfirmDialog>) {}
}

@Component({
    selector: 'data-dialog',
    template: `<div md-dialog-title>{{title}}</div>
        <md-dialog-content>
            <table style="margin:10px;max-width:750px">
                <tr *ngFor="let (key,val) in content">
                    <td style="padding-right:5px"><b>{{key}}</b></td>
                    <td><pre>{{val}}</pre></td>
                </tr>
            </table>
        </md-dialog-content>
        <md-dialog-actions>
            <button type="button" md-dialog-close md-raised-button on-click="dialogRef.close()">{{okbtn}}</button>
        </md-dialog-actions>`,
})
export class DataDialog {
    public okbtn: string;
    public title: string;
    public content: Object;

    constructor(public dialogRef: MdDialogRef<DataDialog>) {}
}