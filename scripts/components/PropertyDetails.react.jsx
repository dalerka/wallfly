var React = require('react');
var Api = require('../utils/Api.js');

var PropertyDetails = React.createClass({
  getInitialState() {
    return {
      ownerFN: '',
      ownerLN: '',
      ownerPhone: '',
      ownerEmail: '',
      agentFN: '',
      agentLN: '',
      agentPhone: '',
      agentEmail: '',
      tenantFN: '',
      tenantLN: '',
      tenantPhone: '',
      tenantEmail: '',
    }
  },

  componentWillMount() {
    Api.getPropertyDetails({
      callback: (err, response) => {
        if (err) {
          // TODO
          return console.log(err);
        }

        // Having the state object coupled to the response object shape
        // might be annoying to reason about. Explitness may be preferable.
        this.setState(response.data);
      }
    });
  },

  render() {

    var ownerDetailRows = [
      { header: 'Name', value: `${this.state.ownerFN} ${this.state.ownerLN}` },
      { header: 'Phone', value: this.state.ownerPhone },
      { header: 'Email', value: this.state.ownerEmail },
    ];

    var agentDetailRows = [
      { header: 'Name', value: `${this.state.agentFN} ${this.state.agentLN}` },
      { header: 'Phone', value: this.state.agentPhone },
      { header: 'Email', value: this.state.agentEmail },
    ];

    var tenantDetailRows = [
      { header: 'Name', value: `${this.state.tenantFN} ${this.state.tenantLN}` },
      { header: 'Phone', value: this.state.tenantPhone },
      { header: 'Email', value: this.state.tenantEmail },
    ]

    return (
      <div style={style.page}>
        <img width="400" src={this.state.photo} />

        <div>
          <h3>Owner</h3>
          <table>
            { ownerDetailRows.map(row => <tr><td>{row.header}</td><td>{row.value}</td></tr>) }
          </table>
        </div>

        <div>
          <h3>Agent</h3>
          <table>
            { agentDetailRows.map(row => <tr><td>{row.header}</td><td>{row.value}</td></tr>) }
          </table>
        </div>

        <div>
          <h3>Tenant</h3>
          <table>
            { tenantDetailRows.map(row => <tr><td>{row.header}</td><td>{row.value}</td></tr>) }
          </table>
        </div>
      </div>
    );
  }
});

var style = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  }
};

export default PropertyDetails;
