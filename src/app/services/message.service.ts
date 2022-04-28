import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material';
import {Dir} from '@angular/cdk/bidi';

@Injectable()
export class MessageService {

	/**
	 * success error warning
	 * @type {string}
	 */
	actionButtonLabel = 'x';
	setAutoHide = true;
	autoHide = 5000;
	horizontalPosition: MatSnackBarHorizontalPosition = 'right';
	verticalPosition: MatSnackBarVerticalPosition = 'bottom';

	constructor(public snackBar: MatSnackBar, private dir: Dir) {
	}

	open(message, label = '', style = ''): void {
		const config = new MatSnackBarConfig();
		config.verticalPosition = this.verticalPosition;
		config.horizontalPosition = this.horizontalPosition;
		config.duration = this.setAutoHide ? this.autoHide : 0;

		if (style === 'success') {
			config.panelClass = 'mat-green';
		}
		if (style === 'info') {
			config.panelClass = 'mat-blue';
		}
		if (style === 'warning') {
			config.panelClass = 'mat-orange';
		}
		if (style === 'error') {
			config.panelClass = 'mat-pink';
		}

		this.actionButtonLabel = (label && label !== '') ? label : this.actionButtonLabel;
		config.direction = this.dir.value;
		this.snackBar.open(message, this.actionButtonLabel, config);
	}

	close() {
		this.snackBar.dismiss();
	}
	// open(message, style, config: any): void {
	//     config = new MatSnackBarConfig();
	//     config.verticalPosition = this.verticalPosition;
	//     config.horizontalPosition = this.horizontalPosition;
	//     config.duration = this.setAutoHide ? this.autoHide : 0;
	//     // config.panelClass = style;
	//     config.direction = this.dir.value;
	//     this.snackBar.open(message, this.actionButtonLabel, config);
	// } 2 3
	//   0.56 x
}
