import React            from 'react';
import Toolbar          from '../../panels/Toolbar';
import ImageIcon        from '../../widgets/ImageIcon';
import merge            from 'mout/src/object/merge';
import IconActionList   from '../../panels/IconActionList';

// Styles
import style from 'HPCCloudStyle/TableListing.mcss';

// Filter helper
import {
    updateQuery,
    itemFilter,
} from '../../utils/Filters';

const TOOLBAR_ACTIONS = {
  add: { name: 'addItem', icon: style.addIcon },
  delete: { name: 'deleteItems', icon: style.deleteIcon },
};

export default React.createClass({

  displayName: 'TableListing',

  propTypes: {
    accessHelper: React.PropTypes.object,
    breadcrumb: React.PropTypes.object,
    items: React.PropTypes.array,
    location: React.PropTypes.object,
    onAction: React.PropTypes.func,
    title: React.PropTypes.string,
    placeholder: React.PropTypes.object,
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      title: 'Items',
    };
  },

  getInitialState() {
    return {
      selected: [],
      actions: [TOOLBAR_ACTIONS.add],
    };
  },

  toolbarAction(action) {
    if (this.props.onAction) {
      this.props.onAction(action, this.state.selected.map((index) => this.props.items[index]));
      // reset selection after action is performed on them.
      this.setState({ selected: [], actions: [TOOLBAR_ACTIONS.add] });
    }
  },

  lineAction(action) {
    const [name, id] = action.split(':');
    this.props.onAction(name, id);
  },

  itemClicked(e) {
    var selectedIndex = -1;
    const filter = '';

    if ((e.metaKey || e.ctrlKey) && e.target) {
      let trEl = e.target;
      while (!trEl.dataset.index) {
        trEl = trEl.parentNode;
      }
      const selected = this.state.selected;
      const actions = this.state.actions;

      selectedIndex = parseInt(trEl.dataset.index, 10);
      if (selected.indexOf(selectedIndex) !== -1) {
        // remove already selected cell
        selected.splice(selected.indexOf(selectedIndex), 1);
        if (selected.length === 0) {
          actions.pop();
        }
      } else {
        // add new cell to selection
        if (selected.length === 0) {
          actions.push(TOOLBAR_ACTIONS.delete);
        }
        selected.push(selectedIndex);
      }

      this.setState({ selected, actions });
      return;
    } else if (e.target) {
      let trEl = e.target;
      while (!trEl.dataset.link) {
        trEl = trEl.parentNode;
      }
      const linkToGo = trEl.dataset.link;
      const id = this.props.items[parseInt(trEl.dataset.index, 10)]._id;

      const location = {
        pathname: linkToGo,
        query: merge(this.props.location.query, { filter }),
        state: this.props.location.state,
      };
      this.props.onAction('click', { location, id });
    }
  },

  render() {
    updateQuery(this.props.location.query.filter);
    const filteredList = this.props.items.filter(itemFilter);
    const helper = this.props.accessHelper;
    let content = null;

    if (this.props.items.length) {
      content = (
        <table className={ style.table }>
          <thead>
              <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th></th>
              </tr>
          </thead>
          <tbody>
            { filteredList.map((item, index) =>
              <tr key={ `${item._id}_${index}` } data-link={ helper.getViewLink(item) } data-index={ index }
                className={this.state.selected.indexOf(index) !== -1 ? style.selected : ''}
              >
                <td onClick={ this.itemClicked } >
                  <ImageIcon data={ helper.getIcon(item) } />
                </td>
                <td onClick={ this.itemClicked } >{ helper.getName(item) }</td>
                <td onClick={ this.itemClicked } title={ helper.getDescription(item) }>{ helper.getDescription(item, true) }</td>
                <td onClick={ this.itemClicked } title={helper.getCreationDate(item)}>{ helper.getCreationDate(item, true) }</td>
                <td onClick={ this.itemClicked } title={helper.getUpdateDate(item)}>{ helper.getUpdateDate(item, true) }</td>
                <td>
                  <IconActionList actions={ helper.getActions(item) } onAction={ this.lineAction } />
                </td>
              </tr>
            )}
          </tbody>
        </table>);
    } else if (this.props.placeholder) {
      content = this.props.placeholder;
    }

    return (
      <div className={ style.container }>
          <Toolbar
            location={ this.props.location }
            title={this.props.title}
            breadcrumb={ this.props.breadcrumb }
            actions={ this.state.actions }
            onAction={ this.toolbarAction }
            filter
          />
          { content }
      </div>);
  },
});
