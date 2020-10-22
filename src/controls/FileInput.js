import React from 'react'
import { BaseInput } from './InputControls'
import { FilePond, registerPlugin } from 'react-filepond'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import 'filepond/dist/filepond.min.css'

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType)

export default class FileInput extends BaseInput {
  onUpdateFiles = fileItems => {
    if (fileItems.length === 0) {
      this.notifyChange(null)
      if (this.props.fileNameField) {
        this.notifyAttrChange(this.props.fileNameField, null)
      }
    } else {
      // even invalid files are passed here for some reason so we do a size check manually
      let pond = this.pond._pond
      if (pond.maxFileSize && fileItems[0].fileSize > pond.maxFileSize) return
      this.notifyChange(fileItems[0].file)
    }
  }

  render() {
    return this.decorate(<FilePond {...this.passThruProps()} ref={ref => (this.pond = ref)} onupdatefiles={this.onUpdateFiles} />)
  }
}
