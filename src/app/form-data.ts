import {FormArray, FormBuilder} from '@angular/forms';

export class FormData {
	public form;
	public isNew = true;

	private formBuilder;
	private structureParent = {};
	private structureChild = [];

	constructor(structure) {
		this.formBuilder = new FormBuilder();
		this.structureParent = structure;
		this.form = this.formBuilder.group(structure);
	}

	public initChild(name, obj) {
		this.structureChild[name] = obj;
		this.form.registerControl(name, this.formBuilder.array([]));
	}

	public addItem(name) {
		(this.form.controls[name] as FormArray).push(this.formBuilder.group(this.structureChild[name]));
	}

	public addItemRoom(name, type, val) {
		this.structureChild[name][type] = val;
		(this.form.controls[name] as FormArray).push(this.formBuilder.group(this.structureChild[name]));
	}

	public removeItem(name, index: number) {
		(this.form.controls[name] as FormArray).removeAt(index);
	}

	public setData(data) {
		this.form.patchValue(data);
		for (let name in this.structureChild) {
			if (typeof data[name] !== 'undefined') {
				data[name].forEach(e => {
					(this.form.controls[name] as FormArray).push(this.formBuilder.group(e));
				});
			}
		}
	}
}
