import React        from 'react';
import Breadcrumb   from '../../widgets/Breadcrumb';
import merge        from 'mout/src/object/merge';
import style        from 'HPCCloudStyle/Toolbar.mcss';

export default React.createClass({
  displayName: 'PreferenceSubBar',

  propTypes: {
    actions: React.PropTypes.array,
    breadcrumb: React.PropTypes.object,
    filter: React.PropTypes.bool,
    location: React.PropTypes.object,
    onAction: React.PropTypes.func,
    title: React.PropTypes.string,
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      filter: false,
      actions: [],
      title: '',
      breadcrumb: {
        paths: [],
        icons: [],
      },
    };
  },

  onAction(event) {
    const action = event.target.dataset.action;
    if (this.props.onAction) {
      this.props.onAction(action);
    }
  },

  updateFilter(e) {
    const filter = e.target.value;

    this.context.router.replace({
      pathname: this.props.location.pathname,
      query: merge(this.props.location.query, { filter }),
      state: this.props.location.state,
    });
  },

  render() {
    return (
      <nav className={ style.container }>
        <Breadcrumb
          className={ style.breadcrumb }
          paths={ this.props.breadcrumb.paths }
          icons={ this.props.breadcrumb.icons }
          active={ this.props.breadcrumb.active }
        />

        <div className={ style.title }>
            { this.props.title }
        </div>

        <div className={ style.actions }>
            { this.props.actions.map((action, index) =>
              <i
                key={`${action.name}_${index}`}
                data-action={action.name}
                onClick={this.onAction}
                className={ [style.actionButton, action.icon].join(' ') }
              ></i>
            )}
            { this.props.filter ?
                <input
                  type="text"
                  className={ style.filter }
                  placeholder="filter"
                  value={ this.props.location.query.filter || '' }
                  onChange={ this.updateFilter }
                />
                : null
            }
        </div>
      </nav>);
  },
});
