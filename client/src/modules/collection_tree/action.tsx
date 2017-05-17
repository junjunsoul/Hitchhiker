import { takeLatest } from 'redux-saga/effects';
import { call, put, takeEvery } from 'redux-saga/effects';
import { errorAction } from '../../common/action';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import RequestManager, { SyncType } from '../../utils/request_manager';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import { syncAction } from '../../action';
import { HttpMethod } from '../../common/http_method';

export const ActiveRecordType = 'active_record_type';
export const RefreshCollectionType = 'refresh_collection';
export const FetchCollectionType = 'fetch_collection';
export const FetchCollectionFailedType = 'fetch_collection_failed';
export const DeleteRecord = 'delete_record';
export const DeleteCollection = 'delete_collection';
export const UpdateCollection = 'update_collection';
export const CreateCollection = 'create_collection';

export const activeRecordAction = (record: DtoRecord) => ({ type: ActiveRecordType, record });

export const fetchCollectionAction = (collections: DtoCollection[]) => ({ type: FetchCollectionType, collections });

export const refreshCollectionAction = () => ({ type: RefreshCollectionType });

export function* refreshCollection() {
    yield takeLatest(RefreshCollectionType, fetchCollection);
}

export function* deleteRecord() {
    yield takeEvery(DeleteRecord, pushDeleteRecordToChannel);
}

function* fetchCollection() {
    try {
        const res = yield call(RequestManager.get, 'http://localhost:3000/api/collections');
        const body = yield res.json();
        yield put(fetchCollectionAction(body));
    } catch (err) {
        yield put(errorAction(FetchCollectionFailedType, err));
    }
}

function* pushDeleteRecordToChannel(action: any) {
    const channelAction = syncAction({ type: SyncType.addRecord, method: HttpMethod.DELETE, url: `http://localhost:3000/api/record/${action.id}` });
    yield put(channelAction);
}