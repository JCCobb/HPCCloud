import { formatFileSize } from '../../utils/Format';
import React from 'react';
import style from 'HPCCloudStyle/JobMonitor.mcss';

import { connect }  from 'react-redux';
import { dispatch } from '../../redux';
import * as Actions from '../../redux/actions/fs';

const indentWidth = 20;

function buildFolders(fs, id, container = {}, depth = -1) {
  const folder = fs.folderMapById[id];
  const children = [];

  // Fill container
  container[id] = { children, depth };

  // Fill children
  if (folder) {
    // - folders first
    folder.folderChildren.forEach(folderId => {
      if (fs.folderMapById[folderId]) {
        const childFolder = fs.folderMapById[folderId].folder;
        if (childFolder) {
          children.push(childFolder);
          buildFolders(fs, childFolder._id, container, depth + 1);
        }
      }
    });

    // - items after
    folder.itemChildren.forEach(itemId => {
      const item = fs.itemMapById[itemId];
      if (item) {
        children.push(item);
      }
    });
  }

  return container;
}

const FileListing = React.createClass({
  displayName: 'FileListing',

  propTypes: {
    folderId: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    folders: React.PropTypes.object, // { [id]: { children: [..], depth: 0 } }
  },

  getDefaultProps() {
    return {
      title: '',
    };
  },

  getInitialState() {
    return {
      isFolderOpened: {}, // object of folders: {id: open(true|false) }
      open: false,
    };
  },

  fileMapper(file, index) {
    var value,
      depth = this.props.folders[file.folderId] ? this.props.folders[file.folderId].depth + 1 : 0;

    // size === 0 ? file size : file size and download button
    if (file.size === 0) {
      value = (<span><em>{formatFileSize(file.size)}</em></span>);
    } else {
      value = (<span key={file._id}>
        <em>{formatFileSize(file.size)} </em>
        <a href={`api/v1/item/${file._id}/download`} target="_blank">
          <i className={style.downloadIcon}></i>
        </a>
      </span>);
    }
    return (<section key={`${file.name}_${index}`} className={ style.listItem }>
      <strong className={ style.itemContent } style={{ paddingLeft: depth * indentWidth }}>
        <i className={style.fileIcon}></i> {file.name}
      </strong>
      <span>{value}</span>
    </section>);
  },

  folderMapper(folder, index) {
    var depth = this.props.folders[folder._id].depth;
    return (<section key={`${folder.name}_${index}`} className={ style.listItem } onClick={this.openFolder} data-folder-id={folder._id}>
      <strong className={ style.itemContent } style={{ paddingLeft: depth * indentWidth }}>
        <i className={style.folderIcon}></i> {folder.name}
      </strong>
      <span>...</span>
    </section>);
  },

  openFolderMapper(folder, index) {
    var depth = this.props.folders[folder._id].depth;
    return (<div key={`${folder.name}_${index}`}>
      <section className={ style.listItem } onClick={this.openFolder} data-folder-id={folder._id}>
        <strong className={ style.itemContent } style={{ paddingLeft: depth * indentWidth }}>
          <i className={style.folderOpenIcon}></i> {folder.name}
        </strong>
        <span>...</span>
      </section>
      { this.props.folders[folder._id].children.map(this.superMapper)}
    </div>);
  },

  superMapper(el, index) {
    if (!el) {return null;}
    if (el._modelType === 'item') {
      return this.fileMapper(el, index);
    } else if (el._modelType === 'folder') {
      if (this.state.isFolderOpened[el._id]) {
        return this.openFolderMapper(el, index);
      }
      return this.folderMapper(el, index);
    }
    return null;
  },

  toggleAdvanced() {
    this.setState({ open: !this.state.open });
  },

  openFolder(e) {
    const isFolderOpened = this.state.isFolderOpened;
    const id = e.currentTarget.dataset.folderId;
    isFolderOpened[id] = !isFolderOpened[id];
    this.setState({ isFolderOpened });
  },

  render() {
    return (<div>
      <div className={ style.toolbar }>
        <div className={ style.title }>{this.props.title}</div>
        <div className={ style.buttons }>
          <span key={status} className={ style.count }>{ `files(${this.props.folders[this.props.folderId].children.length})` }</span>
          <i
            className={ this.state.open ? style.advancedIconOn : style.advancedIconOff}
            onClick={ this.toggleAdvanced }
          ></i>
        </div>
      </div>
      <div className={ this.state.open ? style.taskflowContainer : style.hidden }>
        {this.props.folders[this.props.folderId].children.map(this.superMapper)}
      </div>
    </div>);
  },
});

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */
const pendingRequests = [];

export default connect(
  (state, props) => {
    // FIXME that should be managed inside the state manager
    if (!state.fs.folderMapById[props.folderId] && pendingRequests.indexOf(props.folderId) === -1) {
      pendingRequests.push(props.folderId);
      setImmediate(() => {
        dispatch(Actions.fetchFolder(props.folderId));
      });
    }

    return {
      folders: buildFolders(state.fs, props.folderId),
    };
  }
)(FileListing);