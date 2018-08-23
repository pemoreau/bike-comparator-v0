import React, { Component } from 'react';
import Downshift from 'downshift';

class DownshiftBike extends Component {
  onSelect = item => {
    this.props.setSelected(item);
  };

  render() {
    return (
      <Downshift onSelect={this.onSelect} itemToString={i => i || ''}>
        {/* // pass the downshift props into a callback */}
        {({
          isOpen,
          getToggleButtonProps,
          getItemProps,
          highlightedIndex,
          getLabelProps,
        }) => (
          <div>
            {/* // add a label tag and pass our label text to the getLabelProps function */}
            <label
              style={{ marginTop: '1rem', display: 'block' }}
              {...getLabelProps()}
            >
              Select a {this.props.field}
            </label>
            {/* // add a button for our dropdown and pass the selected item as its content if there's a selected item */}
            <button className="dropdown-button" {...getToggleButtonProps()}>
              {this.props.getSelected()
                ? this.props.getSelected()
                : 'Select a ' + this.props.field + ' ...'}
            </button>
            <div style={{ position: 'relative' }}>
              {/* // if the input element is open, render the div else render nothing */}
              {isOpen ? (
                <div className="downshift-dropdown">
                  {// map through all the items and render them
                  this.props.getItems().map((item, index) => (
                    <div
                      className="dropdown-item"
                      {...getItemProps({ key: index, index, item })}
                      style={{
                        backgroundColor:
                          highlightedIndex === index ? 'lightgray' : 'white',
                        fontWeight: 'normal',
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </Downshift>
    );
  }
}

export default DownshiftBike;
