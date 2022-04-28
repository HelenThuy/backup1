import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material';

@Injectable()
export class CustomIconService {
	constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
	}

	setIcons() {
		this.matIconRegistry.addSvgIcon(
			'c_doctor',
			this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/icons/doctor.svg')
		);
		this.matIconRegistry.addSvgIcon(
			'c_health_report',
			this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/icons/health-report.svg')
		);
		this.matIconRegistry.addSvgIcon(
			'c_report',
			this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/icons/report.svg')
		);
		this.matIconRegistry.addSvgIcon(
			'c_business',
			this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/icons/business.svg')
		);
		this.matIconRegistry.addSvgIcon(
			'c_medical_report',
			this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/icons/medical-report.svg')
		);
		this.matIconRegistry.addSvgIcon(
			'c_chart',
			this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/icons/chart.svg')
		);
		this.matIconRegistry.addSvgIcon(
			'c_hospital',
			this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/icons/hospital.svg')
		);
		this.matIconRegistry.addSvgIcon(
			'c_phone',
			this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/icons/phone.svg')
		);
		this.matIconRegistry.addSvgIcon(
			'c_percentage_off_sticker',
			this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/icons/percentage-off-sticker.svg')
		);
		this.matIconRegistry.addSvgIcon(
			'c_membership',
			this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/icons/membership.svg')
		);
	}
}
