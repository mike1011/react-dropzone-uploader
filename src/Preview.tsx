import React from 'react'
import PropTypes from 'prop-types'

import { formatBytes, formatDuration } from './utils'
import { IPreviewProps } from './Dropzone'
//@ts-ignore
import cancelImg from './assets/cancel.svg'
//@ts-ignore
import removeImg from './assets/remove.svg'
//@ts-ignore
import restartImg from './assets/restart.svg'

// const iconByFn = {
//   cancel: { backgroundImage: `url(${cancelImg})` },
//   remove: { backgroundImage: `url(${removeImg})` },
//   restart: { backgroundImage: `url(${restartImg})` },
// }

class Preview extends React.PureComponent<IPreviewProps> {
  render() {
    const {
      className,
      imageClassName,
      style,
      imageStyle,
      fileWithMeta: { cancel, remove, restart },
      meta: {
        name = '',
        percent = 0,
        size = 0,
        previewUrl,
        status,
        duration,
        validationError,
        videoWidth,
        videoHeight,
        type,
        width,
        height,
      },
      isUpload,
      canCancel,
      canRemove,
      canRestart,
      extra: { minSizeBytes },
    } = this.props

    let title = `${name || '?'} | ${formatBytes(size)}`
    if (duration) title = `${title} | ${formatDuration(duration)} | ${videoWidth}X${videoHeight} | ${type}`
    if (type.startsWith('image/')) title = `${title} | ${width}X${height} px | ${type}`

    //need to add custom styles based on uploaded type - icon,color, etc
    let typeClassName = "";
    if (type.startsWith('image/')) {
      typeClassName = 'image';
    }else if (type.startsWith('video/')) {
      typeClassName = 'video';
    }else if (type.startsWith('audio/')){
      typeClassName = 'audio';
    }else {
      typeClassName = type;
    }

    if (status === 'error_file_size' || status === 'error_validation') {
      return (
        <div className={`${className} error`} style={style}>
          <p className="dzu-previewFileNameError">{title}</p>
          {status === 'error_file_size' && <span>{size < minSizeBytes ? 'File too small' : 'File too big'}</span>}
          {status === 'error_validation' && <span>{String(validationError)}</span>}
          {canRemove && (
            <button type="button" className="dzu-previewButton remove btn btn-outline-danger" onClick={remove}>
              Remove
            </button>
          )}
        </div>
      )
    }

    let error_encountered = ''
    if (status === 'error_upload_params' || status === 'exception_upload' || status === 'error_upload') {
      error_encountered = 'Upload Failed'
    }
    if (status === 'aborted') error_encountered = 'Cancelled'

    return (
      <div className={`${className} ${typeClassName} preview`} style={style}>
        {previewUrl && (
          <div className="imgContainer">
            <img className={imageClassName} style={imageStyle} src={previewUrl} alt={title} title={title} />
            <p className="dzu-previewFileName">{title}</p>
          </div>
        )}
        {!previewUrl && <p className="dzu-previewFileName">{title}</p>}
        <br />
        <div className="dzu-previewStatusContainer">
          {isUpload && (
            <div className="progressDetailsContainer">
              <span className="percent" style={{ marginRight: 10 }}>
                {Math.round(percent)}%
              </span>
              <span className={`${status} status`}>
                {status === 'done' || status === 'headers_received'
                  ? 'Success'
                  : ['started', 'getting_upload_params', 'ready', 'preparing', 'restarted'].includes(status)
                  ? 'Ready'
                  : [
                      'rejected_file_type',
                      'rejected_max_files',
                      'error_file_size',
                      'error_validation',
                      'error_upload_params',
                      'exception_upload',
                      'error_upload',
                      'removed',
                    ].includes(status)
                  ? 'Error'
                  : status === 'uploading'
                  ? 'Uploading'
                  : error_encountered != ''
                  ? error_encountered
                  : 'Upload Now!'}
              </span>
              <progress
                className="myProgress"
                max={100}
                value={status === 'done' || status === 'headers_received' ? 100 : percent}
              />
            </div>
          )}

          <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">

            {status === 'uploading' && canCancel && (
              <button type="button" className="dzu-previewButton cancel btn btn-outline-warning" onClick={cancel}>
                Cancel
              </button>
            )}
            {status !== 'preparing' && status !== 'getting_upload_params' && status !== 'uploading' && canRemove && (
              <button type="button" className="dzu-previewButton remove btn btn-outline-danger" onClick={remove}>
                Remove
              </button>
            )}
            {['error_upload_params', 'exception_upload', 'error_upload', 'aborted', 'ready'].includes(status) &&
              canRestart && (
                <button type="button" className="dzu-previewButton restart btn btn-outline-primary" onClick={restart}>
                  Upload
                </button>
              )}
          </div>
        </div>
      </div>
    )
  }
}

// @ts-ignore
Preview.propTypes = {
  className: PropTypes.string,
  imageClassName: PropTypes.string,
  style: PropTypes.object,
  imageStyle: PropTypes.object,
  fileWithMeta: PropTypes.shape({
    file: PropTypes.any.isRequired,
    meta: PropTypes.object.isRequired,
    cancel: PropTypes.func.isRequired,
    restart: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    xhr: PropTypes.any,
  }).isRequired,
  // copy of fileWithMeta.meta, won't be mutated
  meta: PropTypes.shape({
    status: PropTypes.oneOf([
      'preparing',
      'error_file_size',
      'error_validation',
      'ready',
      'getting_upload_params',
      'error_upload_params',
      'uploading',
      'exception_upload',
      'aborted',
      'error_upload',
      'headers_received',
      'done',
    ]).isRequired,
    type: PropTypes.string.isRequired,
    name: PropTypes.string,
    uploadedDate: PropTypes.string.isRequired,
    percent: PropTypes.number,
    size: PropTypes.number,
    lastModifiedDate: PropTypes.string,
    previewUrl: PropTypes.string,
    duration: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    videoWidth: PropTypes.number,
    videoHeight: PropTypes.number,
    validationError: PropTypes.any,
  }).isRequired,
  isUpload: PropTypes.bool.isRequired,
  canCancel: PropTypes.bool.isRequired,
  canRemove: PropTypes.bool.isRequired,
  canRestart: PropTypes.bool.isRequired,
  files: PropTypes.arrayOf(PropTypes.any).isRequired, // eslint-disable-line react/no-unused-prop-types
  extra: PropTypes.shape({
    active: PropTypes.bool.isRequired,
    reject: PropTypes.bool.isRequired,
    dragged: PropTypes.arrayOf(PropTypes.any).isRequired,
    accept: PropTypes.string.isRequired,
    multiple: PropTypes.bool.isRequired,
    minSizeBytes: PropTypes.number.isRequired,
    maxSizeBytes: PropTypes.number.isRequired,
    maxFiles: PropTypes.number.isRequired,
  }).isRequired,
}

export default Preview
