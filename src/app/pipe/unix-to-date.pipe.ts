import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';


@Pipe({name: 'unixToDate'})
export class UnixToDatePipe implements PipeTransform {
	transform(date) {
		return moment.unix(date).format('DD/MM/YYYY');
	}
}

@Pipe({name: 'unixToDateTime'})
export class UnixToDateTimePipe implements PipeTransform {
	transform(date) {
		return moment.unix(date).format('HH:mm DD/MM/YYYY');
	}
}

@Pipe({name: 'unixToTime'})
export class UnixToTimePipe implements PipeTransform {
	transform(date) {
		return moment.unix(date).format('HH:mm');
	}
}

@Pipe({name: 'unixToTimeAgo'})
export class UnixToTimeAgoPipe implements PipeTransform {
	transform(date) {
		return moment.unix(date).fromNow();
	}
}
