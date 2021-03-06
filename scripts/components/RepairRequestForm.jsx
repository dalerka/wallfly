var React = require('react');
var moment = require('moment');
var Api = require('../utils/Api.js');
var MuiContextified = require('./MuiContextified.jsx');
var mui = require('material-ui');
var TextField = mui.TextField;
var RaisedButton = mui.RaisedButton;
var SelectField = mui.SelectField;
var Dialog = mui.Dialog;
var ImageSelector = require('./ImageSelector.jsx');
var Label = require('./Label.jsx');
var ErrorMessage = require('./ErrorMessage.jsx');
var Radium = require('radium');
var Joi = require('joi');
var JoiError = require('./JoiError.jsx');

/**
 * RepairRequestForm Component.
 * Modal component for rendering a repair request form that allows for
 * submitting a new repair request for the current property.
 */
var RepairRequestForm = React.createClass({
  propTypes: {
    repairRequestAdded: React.PropTypes.func,
  },

  getInitialState() {
    return {
      request: '', // User entered request
      priority: '',
      image: '', //base64 encoding of repair request image
      fileSizeError: '', // file size error message
      validationError: null, // clientside validation error object
    };
  },

  /**
   * Button click event handler for showing the form.
   */
  onButtonClick() {
    this.refs.dialog.show();
  },

  /**
   * Event handler for capturing in the input field state on each keypress.
   * @param  {String} field The identifier for the input field.
   * @param  {Object} event The event object.
   */
  onChange(field, event) {
    this.setState({ [field]: event.target.value });
  },

  /**
   * Form submission event handler. Sends a request to the server to add the
   * repair request, and updates the repair requests if successful.
   * @param  {Object} event The submit event object.
   */
  onSubmit(event) {
    // Clear prior error states.
    this.setState({
      validationError: '',
    });

    var validation = this.validate();
    if (validation.error) {
      this.setState({ validationError: validation.error });
      return;
    }

    // API call to add repair request
    Api.addRepairRequest({
      data: {
        request: this.state.request,
        priority: this.state.priority,
        image: this.state.image,
      },
      callback: (err, response) => {
        if (err) {
          return;
        }

        // Clear the form
        this.setState({
          request: '',
          image: '',
        });

        this.props.repairRequestAdded();
        this.refs.dialog.dismiss();
      }
    });
  },

  /**
   * Validate the form, returns the Joi result of the validation.
   * @return {Object} Joi validation object.
   */
  validate() {
    return Joi.validate({
      request: this.state.request,
      priority: this.state.priority,
      image: this.state.image,
    }, schema);
  },

  /**
   * Image selected event handler
   * @param  {Object} payload JS File API payload of selected file.
   */
  onImageSelected(payload) {
    this.setState({ image: payload.dataURL });
  },

  /**
   * Image size error event handler.
   * @param  {Object} error The error object.
   */
  onImageSizeError(error) {
    var file = error.file;
    var sizeLimit = error.sizeLimit / 1000; // in KB (base10)
    var errorMessage = `${file.name} exceeds size limit of ${sizeLimit}kb.`;
    this.setState({ fileSizeError: errorMessage });
  },

  /**
   * Priorities select dropdown change event handler.
   * @param  {Object} event                 The event object.
   * @param  {Number} selectedPriorityIndex The index of the selected priority.
   */
  onStatusChange(event, selectedPriorityIndex) {
    var priority = priorities[selectedPriorityIndex].text;
    this.setState({ priority: priority });
  },

  render() {
    var { request, fileSizeError, priority, validationError } = this.state;

    var sizeError = fileSizeError ? (
      <ErrorMessage fillBackground={true}>Error: {fileSizeError}</ErrorMessage>
    ) : null;

    var validationError = (validationError) ? (
      <JoiError error={validationError} fillBackground={true} />
    ) : null;

    var standardActions = [
      { text: 'Cancel' },
      { text: 'Lodge Repair Request', onTouchTap: this.onSubmit, ref: 'submit' }
    ];

    return (
      <div style={styles.formContainer}>
        <RaisedButton label="Lodge a New Repair Request"
                      primary={true}
                      onClick={this.onButtonClick} />
        <Dialog
          title="Lodge a New Repair Request"
          actions={standardActions}
          actionFocus="submit"
          modal={this.state.modal}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
          ref="dialog">
          {validationError}
          {sizeError}
          <TextField
            value={request}
            multiLine={true}
            name="Description"
            onChange={this.onChange.bind(this, 'request')}
            floatingLabelText="Describe the Issue"
            hintText="Describe what needs repairing, how urgent it is,
            and how the damage occurred."
            fullWidth />
          <SelectField
            floatingLabelText="Priority of the Issue"
            value={priority}
            valueMember="name"
            onChange={this.onStatusChange}
            menuItems={priorities} />
          <div style={styles.selectorContainer}>
            <Label>Image</Label>
            {sizeError}
            <ImageSelector onImageSelected={this.onImageSelected}
                           onImageSizeError={this.onImageSizeError} />
          </div>
        </Dialog>
      </div>
    );
  }
});

/**
 * Joi validation schema for the form data.
 */
var schema = Joi.object().keys({
  request: Joi.string().max(2048),
  priority: Joi.string().valid(['Urgent', 'Can Wait', 'Information']),
  image: Joi.string(),
});

/**
 * Repair request priorities.
 */
var priorities = [
  { name: 'Urgent', text: 'Urgent' },
  { name: 'Can Wait', text: 'Can Wait' },
  { name: 'Information', text: 'Information' },
];

var styles = {
  formContainer: {
    width: '325px',
  },
  selectorContainer: {
    width: '100%'
  },
};

module.exports = Radium(MuiContextified(RepairRequestForm));
