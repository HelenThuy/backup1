import {NgModule} from '@angular/core';
import {UnixToDatePipe, UnixToTimePipe, UnixToDateTimePipe, UnixToTimeAgoPipe} from './unix-to-date.pipe';

@NgModule({
	imports: [],
	declarations: [UnixToDatePipe, UnixToDateTimePipe, UnixToTimePipe, UnixToTimeAgoPipe],
	exports: [UnixToDatePipe, UnixToDateTimePipe, UnixToTimePipe, UnixToTimeAgoPipe],
})
export class PipeModule {
	static forRoot() {
		return {
			ngModule: PipeModule,
			providers: [],
		};
	}
}
