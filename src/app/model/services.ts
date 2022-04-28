export class Services {
	service_category_id: number;
	service_category_name: string;
}

/**
 * Node for to-do item
 */
export class TreeItemNode {
	children: TreeItemNode[];
	item: string;
	code: string;
	id: string;
	name: string;
	value?: any;
}

/** Flat to-do item node with expandable and level information */
export class TreeItemFlatNode {
	item: string;
	level: number;
	expandable: boolean;
	code: any;
	id: string;
	name: string;
	value?: any;
}
