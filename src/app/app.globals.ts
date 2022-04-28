import {Injectable} from '@angular/core';

@Injectable()
export class Globals {
    API_DOMAIN = 'https://nhapi.hongngochospital.vn';
    API_EHOS_DOMAIN = 'https://hie.hongngochospital.vn';
    // API_DOMAIN = 'http://localhost:9000';
    FILE_DOMAIN = 'https://nhapi.hongngochospital.vn';
    // FILE_DOMAIN = 'http://localhost:9090';
    APP_NAME = 'Hong Ngoc Restaurant';
    // TODO: REPLACE CONFIG DETAILS BELOW WITH YOURS
    FIREBASE_CONFIG = {
        apiKey: 'AIzaSyCZRtTlxL5bBRvquYwLg_Nmz5AKm2U444A',
        authDomain: 'fir-sample-7ba5c.firebaseapp.com"',
        databaseURL: 'https://fir-sample-7ba5c.firebaseio.com/',
        projectId: 'fir-sample-7ba5c',
        storageBucket: 'fir-sample-7ba5c.appspot.com',
        messagingSenderId: '76689972283'
    };

    MAX_RECORD = 100;

    DEFAULT_DIAL_CODE = '+84';

    ROLE_ADMIN_ID = 4;
	ROLE_SUPER_ADMIN_ID = 5;

	NO_IMAGE_URL = '/assets/images/no_image.png';
	NO_IMAGE_SERVER_URL = '/images/no_image.png';

    PARENT_CATEGORY = [
        {
            category_id: '1050100000000000000',
            category_name: 'Nhà bếp',
            category_code: 'nha_bep'
        },
        {
            category_id: '1050600000000000000',
            category_name: 'Quầy bar',
            category_code: 'quay_bar'
        },
        {
            category_id: '1050800000000000000',
            category_name: 'Quầy bánh',
            category_code: 'quay_banh'
        },
        {
            category_id: '1050900000000000000',
            category_name: 'Giặt là',
            category_code: 'giat_la'
        },
    ];
}
