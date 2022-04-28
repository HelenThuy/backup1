import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TreeItemNode} from '../../model/services';

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class CheckListDatabase {
	dataChange = new BehaviorSubject<TreeItemNode[]>([]);
	treeData: any[];

	get data(): TreeItemNode[] { return this.dataChange.value; }

	constructor() {
		this.initialize();
	}

	initialize() {
		// Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
		//     file node as children.
		if (this.treeData) {
			const data = this.buildFileTree(this.treeData, '0');
			// Notify the change.
			this.dataChange.next(data);
		}
	}

	run() {
		const data = this.buildFileTree(this.treeData, '0');
		// Notify the change.
		this.dataChange.next(data);
	}
	/**
	 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
	 * The return value is the list of `TodoItemNode`.
	 */

	buildFileTree(obj: any[], level: string): TreeItemNode[] {
		return obj.filter(o =>
			(<string>o.code).startsWith(level + '.')
			&& (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1
		)
			.map(o => {
				const node = new TreeItemNode();
				node.item = o.text;
				node.code = o.code;
				node.id = o.id;
				node.value = o.value;
				const children = obj.filter(so => (<string>so.code).startsWith(level + '.'));
				if (children && children.length > 0) {
					node.children = this.buildFileTree(children, o.code);
				}
				return node;
			});
	}

	public filter(filterText: string) {
		let filteredTreeData;
		if (filterText) {
			filteredTreeData = this.treeData.filter(d => d.text.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);

			Object.assign([], filteredTreeData).forEach(ftd => {
				let str = (<string>ftd.code);
				while (str.lastIndexOf('.') > -1) {
					const index = str.lastIndexOf('.');
					str = str.substring(0, index);
					if (filteredTreeData.findIndex(t => t.code === str) === -1) {
						const obj = this.treeData.find(d => d.code === str);
						if (obj) {
							filteredTreeData.push(obj);
						}
					}
				}
			});
		} else {
			filteredTreeData = this.treeData;
		}

		// Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
		// file node as children.
		const data = this.buildFileTree(filteredTreeData, '0');
		// Notify the change.
		this.dataChange.next(data);
	}

	public setData(data) {
		this.treeData = data;
	}
}
