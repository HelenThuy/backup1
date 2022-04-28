import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {FlexModule} from '@angular/flex-layout';
import {PolicyRoutes} from './policy.routing';
import {PipeModule} from '../pipe/pipe.module';
import {PolicyComponent} from './policy.component';

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(PolicyRoutes),
		ReactiveFormsModule,
		FlexModule,
		PipeModule,
	],
	declarations: [PolicyComponent],
	providers: []
})

export class PolicyModule {
}
