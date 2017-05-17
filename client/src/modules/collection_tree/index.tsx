import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Menu } from 'antd';
import { refreshCollectionAction, activeRecordAction, DeleteRecord, DeleteCollection, UpdateCollection, CreateCollection } from './action';
import { State } from '../../state';
import RecordFolder from './record_folder';
import RecordItem from './record_item';
import CollectionItem from './collection_item';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { SelectParam } from 'antd/lib/menu';
import * as _ from 'lodash';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import { RecordCategory } from '../../common/record_category';
import './style/index.less';
import { actionCreator } from '../../action';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

interface CollectionListStateProps {
    collections: _.Dictionary<DtoCollection>;
    records: _.Dictionary<_.Dictionary<DtoRecord>>;
    activeKey: string;
}

interface CollectionListDispatchProps {
    refresh: Function;

    activeRecord: (record: DtoRecord) => void;

    deleteRecord(id: string);

    deleteCollection(id: string);

    updateCollection(collection: DtoCollection);

    createCollection(collection: DtoCollection);
}

type CollectionListProps = CollectionListStateProps & CollectionListDispatchProps;

interface CollectionListState {
    openKeys: string[];
}

class CollectionList extends React.Component<CollectionListProps, CollectionListState> {
    refresh: Function;

    constructor(props: CollectionListProps) {
        super(props);
        this.refresh = props.refresh;
        this.state = {
            openKeys: [],
        };
    }

    componentWillMount() {
        this.refresh();
    }

    onOpenChanged = (openKeys: string[]) => {
        this.setState({ openKeys: openKeys });
    }

    onSelectChanged = (param: SelectParam) => {
        this.props.activeRecord(param.item.props.data);
    }

    render() {
        const { collections, records, activeKey } = this.props;
        const recordStyle = { height: '30px', lineHeight: '30px' };

        const loopRecords = (data: DtoRecord[], inFolder: boolean = false) => data.map(r => {

            if (r.category === RecordCategory.folder) {
                const isOpen = this.state.openKeys.indexOf(r.id) > -1;
                const children = _.remove(data, (d) => d.pid === r.id);
                return (
                    <SubMenu className="folder" key={r.id} title={<RecordFolder name={r.name} isOpen={isOpen} />}>
                        {loopRecords(children, true)}
                    </SubMenu>
                );
            }
            return (
                <MenuItem key={r.id} style={recordStyle} data={r}>
                    {<RecordItem id={r.id} name={r.name} url={r.url} method={r.method} inFolder={inFolder} deleteRecord={this.props.deleteRecord} />}
                </MenuItem>
            );
        });

        return (
            <Menu
                className="collection-tree"
                style={{ width: 300 }}
                onOpenChange={this.onOpenChanged}
                mode="inline"
                inlineIndent={0}
                selectedKeys={[activeKey]}
                onSelect={this.onSelectChanged}
            >
                {
                    _.chain(collections).values<DtoCollection>().sortBy('name').value().map(c => {
                        let sortRecords = _.chain(records[c.id]).values<DtoRecord>().sortBy(['category', 'name']).value();
                        return (
                            <SubMenu className="collection-item" key={c.id} title={<CollectionItem name={c.name} />}>
                                {
                                    sortRecords.length === 0 ?
                                        <div style={{ height: 20 }} /> :
                                        loopRecords(sortRecords)
                                }
                            </SubMenu>
                        );
                    })
                }
                <div className="collection-tree-bottom" />
            </Menu>
        );
    }
}

const mapStateToProps = (state: State): CollectionListStateProps => {
    return {
        collections: state.collectionsInfo.collections,
        records: state.collectionsInfo.records,
        activeKey: state.collectionState.activeKey
    };
};

const mapDispatchToProps = (dispatch: Dispatch<{}>): CollectionListDispatchProps => {
    return {
        refresh: () => dispatch(refreshCollectionAction()),
        activeRecord: (record) => dispatch(activeRecordAction(record)),
        deleteRecord: id => dispatch(actionCreator(DeleteRecord, id)),
        deleteCollection: id => dispatch(actionCreator(DeleteCollection, id)),
        updateCollection: collection => dispatch(actionCreator(UpdateCollection, collection)),
        createCollection: collection => dispatch(actionCreator(CreateCollection, collection))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CollectionList);